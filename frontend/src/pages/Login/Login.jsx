import {AuthLayout} from '../../components/PageSurface';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {useAuth} from '../../lib/Auth';

const Login = () => {

    const navigate = useNavigate();
    const {refresh}=useAuth();
    const location = useLocation();

    const {
        register,
        handleSubmit,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    const username=watch("username"), password=watch("password");
    useEffect(() => {
        clearErrors("validationError");
    }, [username,password,clearErrors]);

    const onSubmit = async (data) => {


        try {
            clearErrors("validationError");

            await axios.post(
                '/users/login',
                data,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            await refresh();
            navigate(location.state?.from || '/dashboard');

        } catch (err) {
            if (err.response?.data?.error) {
                setError("validationError", {
                    type: "manual",
                    message: err.response.data.error,
                });
            }
            if(!err.response) setError("validationError", {type:"manual",message:"Cannot reach the server. Please retry."});
        }
    };

    return (
        <AuthLayout>
            <div className="containers">
                {isSubmitting && <p className='submitting'>Submitting...</p>}

                <form action="" onSubmit={handleSubmit(onSubmit)} className='pc-auth-form'>

                    <label htmlFor="auth-username">Username</label>
                    <input id="auth-username"
                        aria-label="Username" placeholder="Username" autoComplete="username" type="text"
                        {...register("username", {
                            required: { value: true, message: "Username is required" }
                        })}
                    />
                    {errors.username && (
                        <p role="alert" className='simple-error'>{errors.username.message}</p>
                    )}

                    <label htmlFor="auth-password">Password</label>
                    <input id="auth-password"
                        aria-label="Password" placeholder="Password" autoComplete="current-password" type="password"
                        {...register("password", {
                            required: { value: true, message: "Password is required" }
                        })}
                    />
                    {errors.password && (
                        <p role="alert" className='simple-error'>{errors.password.message}</p>
                    )}

                    <input type="submit" value={isSubmitting ? 'Logging in…' : 'Log in'} disabled={isSubmitting} />

                    {errors.validationError && (
                        <p role="alert" className='simple-error'>{errors.validationError.message}</p>
                    )}
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
