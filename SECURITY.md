# Security policy

## Supported versions

This project is actively maintained and tested with modern browsers but older versions of `p5.js`, `toxiclibs.js`, and `ffmpeg.wasm`. Some environments may not be supported.

## Reporting a vulnerability

Security is important to us. If you discover any potential security issues or vulnerabilities, please **do not open a public issue**. Instead, contact the maintainer directly:

📬 **Email**: [aidan.wyber@multitude.nl](mailto:aidan.wyber@multitude.nl?subject=p5BrandLab%20security)

## Scope of concerns

We are primarily concerned with:

- Unauthorized file access or data leakage (e.g., local file uploads, clipboard access)
- Arbitrary code execution or script injection
- DOM manipulation vulnerabilities (especially in GUI interactions)

## Security best practices

If you're extending this project:
- Use `createImg`, `createFileInput`, etc. safely.
- Avoid direct DOM manipulation unless necessary.
- Sanitize user inputs if exporting to formats.
- Only allow trusted paths and MIME types in uploads.

---
