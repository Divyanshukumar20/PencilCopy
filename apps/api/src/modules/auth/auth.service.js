export async function signup(data){
console.log(data)
return {
    success: true,
    message: 'SignUp is working',
};
}

export async function login(data){
console.log(data)
return {
    success: true,
    message: 'Login is working',
}
}

export async function logout(data){
console.log(data)
return {
    success: true,
    message: 'Logout is working',
};
}

export async function me(data){
console.log(data)
return {
    success: true,
    message: 'Me is working',
};
}