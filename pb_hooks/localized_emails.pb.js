
console.log(">>> [RESTORING VERSION 7] Loading hooks...");

onMailerRecordVerificationSend((e) => {
    try {
        const record = e.record;
        if (!record || record.getString("language") !== "sw") return;

        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        const appUrl = settings.meta.appURL || "";
        const token = e.meta.token || "";

        const subject = "Thibitisha barua pepe yako ya " + appName;
        const body = `
            <p>Habari,</p>
            <p>Asante kwa kujiunga nasi katika ${appName}.</p>
            <p>Bofya kitufe kilicho hapa chini ili kuthibitisha anwani yako ya barua pepe.</p>
            <p>
              <a class="btn" href="${appUrl}/_/#/auth/confirm-verification/${token}" target="_blank" rel="noopener">Thibitisha</a>
            </p>
            <p>
              Asante,<br/>
              Timu ya ${appName}
            </p>
        `;

        if (e.message) {
            e.message.from = {
                address: settings.meta.senderAddress,
                name:    settings.meta.senderName,
            };
            e.message.subject = subject;
            e.message.html = body;
            e.message.text = "Habari, Thibitisha barua pepe yako hapa: " + appUrl + "/_/#/auth/confirm-verification/" + token;
            console.log(">>> [Verification] Swahili template applied for: " + record.email());
        }
    } catch (err) {
        console.log(">>> [Verification] ERROR: " + err);
    }
}, "users");

onMailerRecordPasswordResetSend((e) => {
    try {
        const record = e.record;
        if (!record || record.getString("language") !== "sw") return;

        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        const appUrl = settings.meta.appURL || "";
        const token = e.meta.token || "";

        const subject = "Badilisha nywila yako ya " + appName;
        const body = `
            <p>Habari,</p>
            <p>Bofya kitufe kilicho hapa chini ili kubadilisha nywila yako.</p>
            <p>
              <a class="btn" href="${appUrl}/_/#/auth/confirm-password-reset/${token}" target="_blank" rel="noopener">Badilisha nywila</a>
            </p>
            <p><i>Ikiwa hukuomba kubadilisha nywila yako, unaweza kupuuza barua pepe hii.</i></p>
            <p>
              Asante,<br/>
              Timu ya ${appName}
            </p>
        `;

        if (e.message) {
            e.message.from = {
                address: settings.meta.senderAddress,
                name:    settings.meta.senderName,
            };
            e.message.subject = subject;
            e.message.html = body;
            e.message.text = "Habari, Bofya hapa ili kubadilisha nywila yako: " + appUrl + "/_/#/auth/confirm-password-reset/" + token;
            console.log(">>> [PasswordReset] Swahili template applied for: " + record.email());
        }
    } catch (err) {
        console.log(">>> [PasswordReset] ERROR: " + err);
    }
}, "users");

onMailerRecordEmailChangeSend((e) => {
    try {
        const record = e.record;
        if (!record || record.getString("language") !== "sw") return;

        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        const appUrl = settings.meta.appURL || "";
        const token = e.meta.token || "";

        const subject = "Thibitisha anwani yako mpya ya barua pepe ya " + appName;
        const body = `
            <p>Habari,</p>
            <p>Bofya kitufe kilicho hapa chini ili kuthibitisha anwani yako mpya ya barua pepe.</p>
            <p>
              <a class="btn" href="${appUrl}/_/#/auth/confirm-email-change/${token}" target="_blank" rel="noopener">Thibitisha barua pepe mpya</a>
            </p>
            <p><i>Ikiwa hukuomba kubadilisha anwani yako ya barua pepe, unaweza kupuuza barua pepe hii.</i></p>
            <p>
              Asante,<br/>
              Timu ya ${appName}
            </p>
        `;

        if (e.message) {
            e.message.from = {
                address: settings.meta.senderAddress,
                name:    settings.meta.senderName,
            };
            e.message.subject = subject;
            e.message.html = body;
            e.message.text = "Habari, Thibitisha barua pepe yako mpya hapa: " + appUrl + "/_/#/auth/confirm-email-change/" + token;
            console.log(">>> [EmailChange] Swahili template applied for: " + record.email());
        }
    } catch (err) {
        console.log(">>> [EmailChange] ERROR: " + err);
    }
}, "users");

onMailerRecordOTPSend((e) => {
    try {
        const record = e.record;
        if (!record || record.getString("language") !== "sw") return;

        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        const otp = e.meta.otp || "";

        const subject = "Msimbo wako wa siri wa " + appName;
        const body = `
            <p>Habari,</p>
            <p>Msimbo wako wa siri wa mara moja ni: <strong>${otp}</strong></p>
            <p><i>Ikiwa hukuomba msimbo wa siri, unaweza kupuuza barua pepe hii.</i></p>
            <p>
              Asante,<br/>
              Timu ya ${appName}
            </p>
        `;

        if (e.message) {
            e.message.from = {
                address: settings.meta.senderAddress,
                name:    settings.meta.senderName,
            };
            e.message.subject = subject;
            e.message.html = body;
            e.message.text = "Habari, Msimbo wako wa siri ni: " + otp;
            console.log(">>> [OTP] Swahili template applied for: " + record.email());
        }
    } catch (err) {
        console.log(">>> [OTP] ERROR: " + err);
    }
}, "users");

console.log(">>> [RESTORING VERSION 7] Hooks loaded.");
