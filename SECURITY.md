# 🔐 Security policy

Welcome to the `p5Catalyst` security policy. We take the security of this open-source project seriously and encourage responsible disclosure of any vulnerabilities.

## 🔄 Supported versions

This project is maintained and tested with:

-   [p5.js](https://p5js.org/): version 1.6.1
-   [p5.js-svg](https://github.com/zenozeng/p5.js-svg): version 1.5.1
-   [toxiclibs.js](https://github.com/hapticdata/toxiclibsjs): version 0.3
-   [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm): version 3?

Older versions may be partially supported but are not actively tested.

## 📨 Reporting a vulnerability

If you discover a security vulnerability in this project, **please do not open a public issue**. Instead, report it directly to the maintainer:

**Contact**: [aidan.wyber@multitude.nl](mailto:aidan.wyber@multitude.nl?subject=p5Catalyst%20security%20issue)

## 📆 Scope of concerns

We are primarily concerned with:

-   Unauthorized access to local files or clipboard data
-   Unsafe DOM manipulation (especially within GUI components)

## ✅ Best practices for contributors

If you're contributing or extending the project:

-   Sanitize any user-generated content before using it in outputs.
-   Restrict uploads to trusted MIME types and dimensions.

---

Thank you for helping keep p5Catalyst safe and open for everyone.

_This policy is inspired by GitHub's official [security policy documentation](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)._

---
