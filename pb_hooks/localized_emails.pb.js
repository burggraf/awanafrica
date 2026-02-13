
onMailerRecordVerificationSend((e) => {
    try {
        const record = e.record;
        if (!record) return;

        const lang = record.getString("language") || "en";
        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        let appUrl = settings.meta.appURL || "";
        
        // Ensure we point to the frontend port (5173) in development
        if (appUrl.indexOf("localhost:8090") !== -1) {
            appUrl = appUrl.replace("8090", "5173");
        }
        
        const token = e.meta.token || "";
        const actionUrl = `${appUrl}/auth/verify?token=${token}&lang=${lang}`;

        let subject, html, text;

        if (lang === "sw") {
            subject = "Thibitisha barua pepe yako ya " + appName;
            html = `
                <p>Habari,</p>
                <p>Asante kwa kujiunga nasi katika ${appName}.</p>
                <p>Bofya kitufe kilicho hapa chini ili kuthibitisha anwani yako ya barua pepe.</p>
                <p>
                  <a href="${actionUrl}">Thibitisha</a>
                </p>
                <p>Asante,<br/>Timu ya ${appName}</p>
            `;
            text = "Habari, Thibitisha barua pepe yako hapa: " + actionUrl;
        } else {
            subject = "Verify your email for " + appName;
            html = `
                <p>Hello,</p>
                <p>Thank you for joining us at ${appName}.</p>
                <p>Click on the button below to verify your email address.</p>
                <p>
                  <a href="${actionUrl}">Verify</a>
                </p>
                <p>Thanks,<br/>${appName} team</p>
            `;
            text = "Hello, Verify your email here: " + actionUrl;
        }

        const msg = new MailerMessage();
        msg.from = { address: settings.meta.senderAddress, name: settings.meta.senderName };
        msg.to = [{ address: record.email() }];
        msg.subject = subject;
        msg.html = html;
        msg.text = text;

        $app.newMailClient().send(msg);
        
        // Stop original
        e.message.to = [];
    } catch (err) {
        console.log("ERROR in verification hook: " + err);
    }
}, "users");

onMailerRecordPasswordResetSend((e) => {
    try {
        const record = e.record;
        if (!record) return;

        const lang = record.getString("language") || "en";
        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        let appUrl = settings.meta.appURL || "";
        
        // Ensure we point to the frontend port (5173) in development
        if (appUrl.indexOf("localhost:8090") !== -1) {
            appUrl = appUrl.replace("8090", "5173");
        }
        
        const token = e.meta.token || "";
        const actionUrl = `${appUrl}/auth/reset-password?token=${token}&lang=${lang}`;

        let subject, html, text;

        if (lang === "sw") {
            subject = "Badilisha nywila yako ya " + appName;
            html = `
                <p>Habari,</p>
                <p>Bofya kitufe kilicho hapa chini ili kubadilisha nywila yako.</p>
                <p>
                  <a href="${actionUrl}">Badilisha nywila</a>
                </p>
                <p><i>Ikiwa hukuomba kubadilisha nywila yako, unaweza kupuuza barua pepe hii.</i></p>
                <p>Asante,<br/>Timu ya ${appName}</p>
            `;
            text = "Habari, Bofya hapa ili kubadilisha nywila yako: " + actionUrl;
        } else {
            subject = "Reset your password for " + appName;
            html = `
                <p>Hello,</p>
                <p>Click on the button below to reset your password.</p>
                <p>
                  <a href="${actionUrl}">Reset password</a>
                </p>
                <p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>
                <p>Thanks,<br/>${appName} team</p>
            `;
            text = "Hello, Reset your password here: " + actionUrl;
        }

        const msg = new MailerMessage();
        msg.from = { address: settings.meta.senderAddress, name: settings.meta.senderName };
        msg.to = [{ address: record.email() }];
        msg.subject = subject;
        msg.html = html;
        msg.text = text;

        $app.newMailClient().send(msg);
        
        // Stop original
        e.message.to = [];
    } catch (err) {
        console.log("ERROR in password reset hook: " + err);
    }
}, "users");

onMailerRecordEmailChangeSend((e) => {
    try {
        const record = e.record;
        if (!record) return;

        const lang = record.getString("language") || "en";
        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        let appUrl = settings.meta.appURL || "";
        
        // Ensure we point to the frontend port (5173) in development
        if (appUrl.indexOf("localhost:8090") !== -1) {
            appUrl = appUrl.replace("8090", "5173");
        }
        
        const token = e.meta.token || "";
        const actionUrl = `${appUrl}/auth/confirm-email-change?token=${token}&lang=${lang}`;

        let subject, html, text;

        if (lang === "sw") {
            subject = "Thibitisha anwani yako mpya ya barua pepe ya " + appName;
            html = `
                <p>Habari,</p>
                <p>Bofya kitufe kilicho hapa chini ili kuthibitisha anwani yako mpya ya barua pepe.</p>
                <p>
                  <a class="btn" href="${actionUrl}" target="_blank" rel="noopener">Thibitisha barua pepe mpya</a>
                </p>
                <p><i>Ikiwa hukuomba kubadilisha anwani yako ya barua pepe, unaweza kupuuza barua pepe hii.</i></p>
                <p>Asante,<br/>Timu ya ${appName}</p>
            `;
            text = "Habari, Thibitisha barua pepe yako mpya hapa: " + actionUrl;
        } else {
            subject = "Confirm your new email address for " + appName;
            html = `
                <p>Hello,</p>
                <p>Click on the button below to confirm your new email address.</p>
                <p>
                  <a class="btn" href="${actionUrl}" target="_blank" rel="noopener">Confirm new email</a>
                </p>
                <p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>
                <p>Thanks,<br/>${appName} team</p>
            `;
            text = "Hello, Confirm your new email here: " + actionUrl;
        }

        const msg = new MailerMessage();
        msg.from = { address: settings.meta.senderAddress, name: settings.meta.senderName };
        msg.to = [{ address: record.email() }];
        msg.subject = subject;
        msg.html = html;
        msg.text = text;

        $app.newMailClient().send(msg);
        
        // Stop original
        e.message.to = [];
    } catch (err) {
        console.log("ERROR in email change hook: " + err);
    }
}, "users");

onMailerRecordOTPSend((e) => {
    try {
        const record = e.record;
        if (!record) return;

        const lang = record.getString("language") || "en";
        const settings = $app.settings();
        const appName = settings.meta.appName || "AwanAfrica";
        const otp = e.meta.otp || "";

        let subject, html, text;

        if (lang === "sw") {
            subject = "Msimbo wako wa siri wa " + appName;
            html = `
                <p>Habari,</p>
                <p>Msimbo wako wa siri wa mara moja ni: <strong>${otp}</strong></p>
                <p><i>Ikiwa hukuomba msimbo wa siri, unaweza kupuuza barua pepe hii.</i></p>
                <p>Asante,<br/>Timu ya ${appName}</p>
            `;
            text = "Habari, Msimbo wako wa siri ni: " + otp;
        } else {
            subject = "OTP for " + appName;
            html = `
                <p>Hello,</p>
                <p>Your one-time password is: <strong>${otp}</strong></p>
                <p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>
                <p>Thanks,<br/>${appName} team</p>
            `;
            text = "Hello, Your one-time password is: " + otp;
        }

        const msg = new MailerMessage();
        msg.from = { address: settings.meta.senderAddress, name: settings.meta.senderName };
        msg.to = [{ address: record.email() }];
        msg.subject = subject;
        msg.html = html;
        msg.text = text;

        $app.newMailClient().send(msg);
        
        // Stop original
        e.message.to = [];
    } catch (err) {
        console.log("ERROR in OTP hook: " + err);
    }
}, "users");
