package emaillist.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.stream.Stream;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import emaillist.dto.JsonResult;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootConfiguration
@EnableWebSecurity
public class Config {

	@Bean
	SecurityFilterChain scurityFilterChain(HttpSecurity http, JwtAuthenticationConverter jwtAuthenticationConverter, AccessDeniedHandler accessDeniedHandler, AuthenticationEntryPoint authenticationEntryPoint) throws Exception {

        http
        	.csrf(AbstractHttpConfigurer::disable)
        	.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        	.logout(AbstractHttpConfigurer::disable)
        	.anonymous(AbstractHttpConfigurer::disable)
        	.authorizeHttpRequests(acl -> { //authorizationManagerRequestMatcherRegistry
        		acl
        			.requestMatchers(new RegexRequestMatcher("^/(\\?kw=.*)?$", "GET")).hasRole("READ") //?kw GET으로 들어오는 애는 read 권한 있어야 함
					.requestMatchers(new RegexRequestMatcher("^/$", "POST")).hasRole("WRITE")
					.requestMatchers(new RegexRequestMatcher("^/\\d*$", "DELETE")).hasRole("WRITE")
					.anyRequest().denyAll();
			});
		
		http
			.oauth2ResourceServer(oauth2 -> { // resource server 세팅
				oauth2
					// The oauth2ResourceServer Method will Validate the Bound JWT Token against Keycloak Server
					.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
					
					// 401
					.authenticationEntryPoint(authenticationEntryPoint) //토큰 없이 들어오면 에러처리
					
					// 403
					.accessDeniedHandler(accessDeniedHandler); //토큰 있는데 권한 없으면 여기서 처리
		});

		return http.build();
	}

	@Component
	static public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
		@Override
		public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401(Invalid Token)
		    response.setContentType("application/json");
		    response.setCharacterEncoding("utf-8");

			String json = new ObjectMapper().writeValueAsString(JsonResult.fail("401 Unauthorized"));
			response.getOutputStream().write(json.getBytes(StandardCharsets.UTF_8));
		}
	}

	@Component
	static public class CustomAccessDeniedHandler implements AccessDeniedHandler {
		@Override
		public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403(Wrong API Endpoint...)
			response.setContentType("application/json");
		    response.setCharacterEncoding("utf-8");

			String json = new ObjectMapper().writeValueAsString(JsonResult.fail("403 Forbidden"));
			response.getOutputStream().write(json.getBytes(StandardCharsets.UTF_8));
		}
	}

	@Component
	@RequiredArgsConstructor
	static public class JwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {

		private final Converter<Jwt, Collection<? extends GrantedAuthority>> jwtGrantedAuthoritiesConverter;

		@Override
		public JwtAuthenticationToken convert(Jwt jwt) {
			final var authorities = jwtGrantedAuthoritiesConverter.convert(jwt);
			final String username = JsonPath.read(jwt.getClaims(), "preferred_username");
			JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities, username);

			log.info("authorities:{}", authorities);
			log.info("username:{}", username);
			log.info("token:{}", token);

			return token;
		}

		@Component
		static public class JwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<? extends GrantedAuthority>> {

			@Override
			public Collection<? extends GrantedAuthority> convert(@NonNull Jwt source) {

				return Stream.of("$.realm_access.roles", "$.resource_access.*.roles").flatMap(path -> {

					Object claim = JsonPath.read(source.getClaims(), path);

					switch (claim) {
						case null -> {
							return Stream.empty();
						}
						case String strClaim -> {
							return Stream.of(strClaim.split(","));
						}
						case String[] strClaim -> {
							return Stream.of(strClaim);
						}
						default -> {
						}
					}

					if (!Collection.class.isAssignableFrom(claim.getClass())) {
						return Stream.empty();
					}

					final var iter = ((Collection<?>) claim).iterator();

					if (!iter.hasNext()) {
						return Stream.empty();
					}

					final var firstItem = iter.next();

					if (firstItem instanceof String) {
						return ((Collection<?>) claim).stream();
					}

					if (Collection.class.isAssignableFrom(firstItem.getClass())) {
						return ((Collection<?>) claim).stream().flatMap(colItem -> ((Collection<?>)colItem).stream()).map(String.class::cast);
					}

					return Stream.empty();

				}).map(strAuthority -> {
					// supporting Spring Security's Checking Authority "ROLE_" Based.
					return ("ROLE_" + strAuthority); //스프링시큐리티는 키클락에 저장해둔 롤에 ROLE_을 앞에 붙임
				}).map(SimpleGrantedAuthority::new).map(GrantedAuthority.class::cast).toList();
			}
		}
	}
}
