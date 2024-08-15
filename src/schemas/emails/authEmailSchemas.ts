export function resetPasswordEmail( OTP:string): string {
    return `Hello,
    
    You have requested to reset your password. Please use the following OTP to reset your password:
    
    OTP: ${OTP}
    
    If you did not request this, please ignore this email.
    
    Thanks,
    QuickFins team`;
}