import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        clearErrors,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        setError,
    } = useForm();

    useEffect(() => {
        clearErrors("validationError");
    }, [watch("username"), watch("password")]);

    const onSubmit = async (data) => {
        console.log(data);

        try {
            clearErrors("validationError");

            const response = await axios.post(
                'http://localhost:3000/users/login',
                data,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            navigate('/afterLogin');

        } catch (err) {
            if (err.response?.data?.error) {
                setError("validationError", {
                    type: "manual",
                    message: err.response.data.error,
                });
            }
            console.log(err);
        }
    };

    return (
        <>
            <div className="containers">
                {isSubmitting && <p className='submitting'>Submitting...</p>}

                <form action="" onSubmit={handleSubmit(onSubmit)} className='flex'>

                    <input
                        type="text"
                        {...register("username", {
                            required: { value: true, message: "Username is required" }
                        })}
                    />
                    {errors.username && (
                        <p className='simple-error'>{errors.username.message}</p>
                    )}

                    <input
                        type="password"
                        {...register("password", {
                            required: { value: true, message: "Password is required" }
                        })}
                    />
                    {errors.password && (
                        <p className='simple-error'>{errors.password.message}</p>
                    )}

                    <input type="submit" value="Submit" disabled={isSubmitting} />

                    {errors.validationError && (
                        <p className='simple-error'>{errors.validationError.message}</p>
                    )}
                </form>
            </div>
        </>
    );
};

export default Login;
