/**
 * Kiểm tra không cho phép gửi SĐT hoặc Email khách hàng vào Prompt AI (AGENTS.md & UC06 mục 4)
 */
export function containsCustomerPiiInPrompt(text: string): { hasPii: boolean; reason?: string } {
  if (!text) return { hasPii: false };
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(text)) {
    return {
      hasPii: true,
      reason:
        'Prompt chứa địa chỉ email. Theo quy định bảo mật BA (UC06), tuyệt đối không gửi email/SĐT khách hàng sang AI bên thứ ba.',
    };
  }
  const vnPhoneRegex = /(?:\+84|0)(?:3|5|7|8|9)(?:[\s.-]*\d){8}\b/;
  if (vnPhoneRegex.test(text)) {
    return {
      hasPii: true,
      reason:
        'Prompt chứa số điện thoại. Theo quy định bảo mật BA (UC06), tuyệt đối không gửi SĐT/thông tin liên hệ khách hàng sang AI bên thứ ba.',
    };
  }
  return { hasPii: false };
}
