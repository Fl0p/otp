/***************************************************
 * TOTP Generator with Web Crypto API
 ***************************************************/

// DOM Elements
const secretInput = document.getElementById("secret");
const labelInput = document.getElementById("label");
const issuerInput = document.getElementById("issuer");
const countdownElem = document.getElementById("countdown");
const currentTOTPElem = document.getElementById("currentTOTP");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");
const generateLabelBtn = document.getElementById("generateLabelBtn");
const digitsSelect = document.getElementById("digits");
const periodSelect = document.getElementById("period");
const algorithmSelect = document.getElementById("algorithm");
const otpauthUriInput = document.getElementById("otpauthUri");
const copyUriBtn = document.getElementById("copyUriBtn");
const qrSection = document.getElementById("qrSection");
const qrCodeCanvas = document.getElementById("qrCode");

// QR Code instance
let qrCode = null;

/***************************************************
 * Base32 Encode
 ***************************************************/
function base32Encode(buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const bytes = new Uint8Array(buffer);
    let bits = "";
    let result = "";

    // Convert bytes to bits
    for (let i = 0; i < bytes.length; i++) {
        bits += bytes[i].toString(2).padStart(8, "0");
    }

    // Convert bits to base32
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substr(i, 5).padEnd(5, "0");
        result += alphabet[parseInt(chunk, 2)];
    }

    return result;
}

/***************************************************
 * Base32 Decode (RFC 4648)
 ***************************************************/
function base32Decode(input) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const sanitized = input
        .replace(/=+$/, "")
        .toUpperCase()
        .replace(/[^A-Z2-7]+/g, "");

    let bits = "";
    const output = [];

    for (let i = 0; i < sanitized.length; i++) {
        const val = alphabet.indexOf(sanitized[i]);
        if (val === -1) {
            throw new Error("Invalid character found in Base32 string.");
        }
        bits += val.toString(2).padStart(5, "0");
    }

    for (let j = 0; j + 7 < bits.length; j += 8) {
        output.push(parseInt(bits.substr(j, 8), 2));
    }

    return new Uint8Array(output);
}

/***************************************************
 * Generate Random Secret
 ***************************************************/
function generateRandomSecret() {
    // Generate 20 random bytes (160 bits) - standard for TOTP
    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    return base32Encode(randomBytes);
}

/***************************************************
 * Generate Random Label and Service
 ***************************************************/
function generateRandomLabel() {
    const adjectives = ['Nice', 'Big', 'Smart', 'Happy', 'Brave', 'Cool', 'Swift', 'Kind', 'Wise', 'Bold', 'Gentle', 'Mighty', 'Clever', 'Quick', 'Strong', 'Bright', 'Calm', 'Eager', 'Fierce', 'Funny', 'Jolly', 'Lazy', 'Lucky', 'Noble', 'Proud', 'Quiet', 'Shiny', 'Silly', 'Tiny', 'Wild'];
    const animals = ['Cat', 'Dog', 'Penguin', 'Hippo', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Eagle', 'Panda', 'Koala', 'Dolphin', 'Elephant', 'Rabbit', 'Monkey', 'Giraffe', 'Zebra', 'Owl', 'Hawk', 'Shark', 'Whale', 'Seal', 'Otter', 'Deer', 'Moose', 'Lynx', 'Raven', 'Falcon', 'Cheetah'];
    const services = ['TOTP', 'Apple', 'Google', 'Github', 'Microsoft', 'Amazon', 'Meta', 'Twitter', 'LinkedIn', 'Discord', 'Slack', 'Dropbox', 'PayPal', 'Stripe', 'Auth', 'Secure', 'Guard', 'Shield', 'Vault', 'Safe', 'Lock', 'Key'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];
    
    return {
        label: `${randomAdjective}${randomAnimal}`,
        service: randomService
    };
}

/***************************************************
 * Generate HMAC with Web Crypto API
 ***************************************************/
async function hmacSign(keyBytes, msgBytes, algorithm) {
    const algoKey = { name: "HMAC", hash: { name: algorithm } };
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        algoKey,
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
    return new Uint8Array(signature);
}

/***************************************************
 * TOTP Generation
 ***************************************************/
async function generateTOTP(secret, timeNow, digits, period, algorithm) {
    const keyBytes = base32Decode(secret);
    const timeStep = Math.floor(timeNow / period);

    const msgBytes = new ArrayBuffer(8);
    const msgView = new DataView(msgBytes);
    // Write timeStep as big-endian 64bit
    msgView.setUint32(0, 0); // high 4 bytes
    msgView.setUint32(4, timeStep); // low 4 bytes

    const hmac = await hmacSign(keyBytes, msgBytes, algorithm);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binCode =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        ((hmac[offset + 3] & 0xff));

    const fullCode = binCode % (10 ** digits);
    return String(fullCode).padStart(digits, "0");
}

/***************************************************
 * Get Current Unix Time
 ***************************************************/
function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}

/***************************************************
 * Generate otpauth:// URI
 ***************************************************/
function generateOtpauthUri() {
    const secret = secretInput.value.trim();
    const label = labelInput.value.trim();
    const issuer = issuerInput.value.trim() || "TOTP";
    const digits = digitsSelect.value;
    const period = periodSelect.value;
    const algorithm = algorithmSelect.value.replace(/-/g, ""); // SHA-1 -> SHA1

    if (!secret || !label) {
        otpauthUriInput.value = "";
        qrSection.style.display = "none";
        return;
    }

    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    const uri = `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${algorithm}&digits=${digits}&period=${period}`;
    
    otpauthUriInput.value = uri;
    generateQRCode(uri);
}

/***************************************************
 * Generate QR Code
 ***************************************************/
function generateQRCode(uri) {
    if (!qrCode) {
        qrCode = new QRious({
            element: qrCodeCanvas,
            size: 200,
            value: uri,
            level: 'H'
        });
    } else {
        qrCode.value = uri;
    }
    qrSection.style.display = "block";
}

/***************************************************
 * Update TOTP Display
 ***************************************************/
async function updateTOTPDisplay() {
    const secret = secretInput.value.trim();
    const digits = parseInt(digitsSelect.value, 10);
    const period = parseInt(periodSelect.value, 10);
    const algorithm = algorithmSelect.value;

    if (!secret) {
        currentTOTPElem.textContent = "-".repeat(digits);
        countdownElem.textContent = "Valid for --s";
        return;
    }

    const unixTime = getUnixTime();
    const currentStep = Math.floor(unixTime / period);
    const nextStep = (currentStep + 1) * period;

    try {
        const currentCode = await generateTOTP(secret, unixTime, digits, period, algorithm);
        currentTOTPElem.textContent = currentCode;

        const secondsLeft = nextStep - unixTime;
        countdownElem.textContent = `Valid for ${secondsLeft}s`;
    } catch (err) {
        console.error("Error generating TOTP:", err);
        currentTOTPElem.textContent = "Error";
        countdownElem.textContent = "Valid for --s";
    }
}

/***************************************************
 * Event Listeners
 ***************************************************/
secretInput.addEventListener("input", () => {
    updateTOTPDisplay();
    generateOtpauthUri();
});

labelInput.addEventListener("input", generateOtpauthUri);
issuerInput.addEventListener("input", generateOtpauthUri);

digitsSelect.addEventListener("change", () => {
    updateTOTPDisplay();
    generateOtpauthUri();
});

periodSelect.addEventListener("change", () => {
    updateTOTPDisplay();
    generateOtpauthUri();
});

algorithmSelect.addEventListener("change", () => {
    updateTOTPDisplay();
    generateOtpauthUri();
});

generateBtn.addEventListener("click", () => {
    const newSecret = generateRandomSecret();
    secretInput.value = newSecret;
    updateTOTPDisplay();
    generateOtpauthUri();
});

generateLabelBtn.addEventListener("click", () => {
    const { label, service } = generateRandomLabel();
    labelInput.value = label;
    issuerInput.value = service;
    generateOtpauthUri();
});

copyBtn.addEventListener("click", async () => {
    const totpValue = currentTOTPElem.textContent.trim();
    if (totpValue && totpValue !== "------" && totpValue !== "Error") {
        try {
            await navigator.clipboard.writeText(totpValue);
            copyBtn.textContent = "✅";
            setTimeout(() => {
                copyBtn.textContent = "📋";
            }, 1000);
        } catch (err) {
            console.error("Failed to copy TOTP:", err);
        }
    }
});

copyUriBtn.addEventListener("click", async () => {
    const uriValue = otpauthUriInput.value.trim();
    if (uriValue) {
        try {
            await navigator.clipboard.writeText(uriValue);
            copyUriBtn.textContent = "✅";
            setTimeout(() => {
                copyUriBtn.textContent = "📋";
            }, 1000);
        } catch (err) {
            console.error("Failed to copy URI:", err);
        }
    }
});

/***************************************************
 * Initialization
 ***************************************************/
// Start TOTP auto-refresh
setInterval(updateTOTPDisplay, 1000);

// Initial display update
updateTOTPDisplay();
