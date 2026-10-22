# Public favicon fixtures

These files are used only by the isolated HTTP QA server as sample Chrome-cache responses. They are not shipped in the extension. No private browser profile is read.

- `github.ico`: https://github.com/favicon.ico
- `figma.ico`: https://static.figma.com/app/icon/1/favicon.ico
- Downloaded on 2026-10-22. Original public service favicons, unmodified.

Other URLs and the `iconMissing` fixture state deliberately return an undecodable image to verify fallback. In the real extension, `chrome.runtime.getURL('/_favicon/')` is served by Chrome, not this mock.
