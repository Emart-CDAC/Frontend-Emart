export const login = () => 
{
    window.location.href = "http://localhost:8080/oauth2/authorization/google";


}
export const logout = () =>
{
    window.location.href = "http://localhost:8080/api/auth/logout";
}