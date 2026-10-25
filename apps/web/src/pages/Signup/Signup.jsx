import { set, useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// =========================
// Main SignUp Component
// =========================
const SignUp = () => {

    // =================================
    // useForm hook from react-hook-form
    // =================================
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        reset,
    } = useForm();

    // =====================
    // State & Refs
    // =====================
    const [isSuccessful, setIsSuccessful] = useState(false); // Track if form submission is successful
    const typingp = useRef();                                 // Ref for typing timeout on password
    const username = watch('username');                       // Watch changes in username
    const password = watch('password');                       // Watch changes in password

    // ========================================
    // Disable submit if form is invalid
    // ========================================
    const disableSubmit =
        isSubmitting ||
        errors.usernameLength ||
        errors.usernameSpecialCharacter ||
        errors.password ||
        !username ||
        !password;

    // ====================================================================
    // Username validation (length & special character) on every change
    // ====================================================================
    useEffect(() => {
        // Clear custom errors when user types
        clearErrors(['usernameLength', 'usernameSpecialCharacter', 'usernameExists', 'validationError']);

        if (!username) return;

        // Validate minimum length
        if (username.length < 3) {
            setError("usernameLength", {
                type: "manual",
                message: "Username must be at least 3 characters long"
            });
            clearErrors("usernameExists");
            clearErrors("usernameSpecialCharacter");
        }

        // Validate allowed characters
        else if (/[^A-Za-z0-9_]/.test(username)) {
            setError("usernameSpecialCharacter", {
                type: "manual",
                message: "Username can only contain letters, numbers, and underscores"
            });
        }

        // Clear errors if valid
        if (username.length >= 3) clearErrors('usernameLength');
        if (!/[^A-Za-z0-9_]/.test(username)) clearErrors('usernameSpecialCharacter');

    }, [username]);

    // ===================================================
    // Server-side username check on blur (availability)
    // ===================================================
    const onUsernameBlur = async () => {
        if (!username) {
            clearErrors('usernameLength');
            clearErrors('usernameSpecialCharacter');
            clearErrors('usernameExists');
            return;
        }

        try {
            const res = await axios.post(
                'http://localhost:3000/users/existinguser',
                { username },
            );

            if (res.data.exists) {
                setError("usernameExists", {
                    type: "manual",
                    message: "Username not available"
                });
            } else {
                clearErrors("usernameExists");
            }

        } catch (err) {
            setError("validationError", {
                type: "manual",
                message: "Server error. Please try again later."
            });
        }
    };

    // ====================================
    // Password validation after user stops typing
    // ====================================
    useEffect(() => {
        clearErrors(['password', 'validationError']);
        if (!password) return;

        if (typingp.current) clearTimeout(typingp.current);

        typingp.current = setTimeout(() => {
            if (password.length < 6) {
                setError("password", {
                    type: "manual",
                    message: "Password must be at least 6 characters long"
                });
            }
            else if (!/[0-9]/.test(password)) {
                setError("password", {
                    type: "manual",
                    message: "Password must contain at least one number"
                });
            }
            else if (!/[^A-Za-z0-9]/.test(password)) {
                setError("password", {
                    type: "manual",
                    message: "Password must contain at least one special character"
                });
            }
            else {
                clearErrors("password");
            }
        }, 1000);

        return () => clearTimeout(typingp.current);

    }, [password]);

    // ======================
    // Form submission logic
    // ======================
    const onSubmit = async (data) => {
        console.log(data);

        try {
            const response = await axios.post(
                'http://localhost:3000/users/signup',
                data,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(response);
            setIsSuccessful(true); // Set form as successful
            reset(); // Reset form fields after successful submission
            clearErrors(); // Clear all errors after successful submission

        } catch (err) {
            // Backend custom error
            if (err.response?.data?.error) {
                setError("validationError", {
                    type: "manual",
                    message: err.response.data.error
                });
            }

            // Express-Validator username error
            if (err.response?.data?.errors?.username) {
                setError("username", {
                    type: "manual",
                    message: err.response.data.errors.username
                });
            }

            // Express-Validator password error
            if (err.response?.data?.errors?.password) {
                setError("password", {
                    type: "manual",
                    message: err.response.data.errors.password
                });
            }

            // Network/server error
            if (!err.response) {
                setError("validationError", {
                    type: "manual",
                    message: "Server error. Please try again later."
                });
            }
        }
    };

    // ======================
    // Render JSX
    // ======================
    return (
        <>
            <div className="containers">
                {isSubmitting && <p className='submitting'>Submitting...</p>}

                <form onSubmit={handleSubmit(onSubmit)} className='flex'>

                    {/* Username input */}
                    <input
                        type="text"
                        {...register("username", {
                            required: { value: true, message: "Username is required" }
                        })}
                        onBlur={onUsernameBlur}
                    />
                    {errors.usernameLength && <p className='simple-error'>{errors.usernameLength.message}</p>}
                    {errors.usernameSpecialCharacter && <p className='simple-error'>{errors.usernameSpecialCharacter.message}</p>}
                    {errors.usernameExists && <p className='simple-error'>{errors.usernameExists.message}</p>}
                    {errors.username && <p className='simple-error'>{errors.username.message}</p>}

                    {/* Password input */}
                    <input
                        type="password"
                        {...register("password", {
                            required: { value: true, message: "Password is required" },
                        })}
                    />
                    {errors.password && <p className='simple-error'>{errors.password.message}</p>}

                    {/* Submit button */}
                    <input type="submit" value="Submit" disabled={disableSubmit} />

                    {/* Server-side or unknown validation error */}
                    {errors.validationError && <p className='simple-error'>{errors.validationError.message}</p>}
                </form>
            </div>

            {/* Success state button */}
            {isSuccessful && <Link to = "/login"><button>LogIn</button></Link>}
        </>
    );
};

export default SignUp;
