import React, {useRef} from 'react';
import serialize from 'form-serialize';
import * as styles from './assets/scss/RegisterForm.scss';

function RegisterForm({addEmail}) {
    const refForm = useRef(null);

    return (
        <form
            ref={refForm}
            className={styles.Register_Form}
            onSubmit={(e) => {
                e.preventDefault();

                const email = serialize(e.target, {hash: true});
                addEmail(email);

                refForm.current.reset();
            }}>
            <input type={'text'} name={'firstName'} placeholder={'성'} className={styles.Input_First_Name}/>
            <input type={'text'} name={'lastName'} placeholder={'이름'} className={styles.Input_Last_Name}/>
            <input type={'text'} name={'email'} placeholder={'이메일'} className={styles.Input_Email}/>
            <input type={'submit'} value={'등록'} />
        </form>
    );
}

export default RegisterForm;