# Simple Private TOTP Generator

A secure, offline TOTP (Time-based One-Time Password) generator for two-factor authentication and identity verification.

## 🔐 Overview

This TOTP generator helps you stay secure in the age of deepfakes and AI-generated content. Create shared secret codes with people you trust to verify each other's identity during online communications.

**Live Demo:** [https://fl0p.github.io/otp](https://fl0p.github.io/otp)

## ✨ Features

- **Completely Offline** - All calculations performed locally in your browser
- **Privacy First** - No data transmitted to any server or stored
- **Web Crypto API** - Uses native browser cryptography
- **Customizable Parameters**:
  - Algorithms: SHA-1, SHA-256, SHA-512
  - Code length: 6-10 digits
  - Period: 10-60 seconds
- **QR Code Generation** - Quick setup via QR code scanning
- **Random Generation** - Generate random secrets, labels, and service names
- **Multiple Codes** - Create different codes for various purposes

## 🚀 How to Use

1. **Enter secret key** (Base32 format) or generate a new one with 🎲
2. **Configure parameters** if different from standard (6 digits, 30 seconds, SHA-1)
3. **Specify Label and Service** to identify the account, or generate random ones 🎲
4. **Copy TOTP code** 📋 or scan the QR code with an authenticator app

## 💡 Use Cases

### Identity Verification
Create a shared secret code with someone you trust. When communicating online (messages, calls, or video), compare the current codes to verify each other's identity. If they match, you're talking to the real person.

### Multiple Authentication Channels
Use meaningful Labels and Services to organize codes for:
- Business partners
- Family members
- Colleagues
- Friends
- Different services and accounts

Each shared secret serves as a unique authentication channel.

## 🛠️ Technologies

- HTML5
- CSS3 (Grid Layout)
- Vanilla JavaScript
- Web Crypto API
- [QRious](https://github.com/neocotic/qrious) - QR code generation

## 📦 Installation

### Use Online
Simply visit [https://fl0p.github.io/otp](https://fl0p.github.io/otp)

### Self-Host
1. Clone the repository:
   ```bash
   git clone https://github.com/Fl0p/otp.git
   cd otp
   ```

2. Open `index.html` in your browser or serve with any web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000`

## 🔒 Security

- All cryptographic operations use the Web Crypto API
- No external dependencies for core TOTP functionality
- QR code library loaded from CDN (can be self-hosted)
- No analytics, tracking, or data collection
- Works completely offline after initial load

## 📄 TOTP Standard

Implements [RFC 6238](https://tools.ietf.org/html/rfc6238) - TOTP: Time-Based One-Time Password Algorithm

The generated `otpauth://` URI follows the [Key Uri Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format) specification and is compatible with:
- Google Authenticator
- Authy
- 1Password
- Microsoft Authenticator
- And other standard authenticator apps

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Based on TOTP implementation principles
- Inspired by the need for simple identity verification in the age of AI
- QR code generation powered by [QRious](https://github.com/neocotic/qrious)

---

**Stay secure, stay private.** 🔐
