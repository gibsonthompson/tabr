/* ═══════════════════════════
   Anthropic API (proxied through Vite dev server)
   ═══════════════════════════ */

export async function parseScreenshot(base64Data, mediaType, apiKey) {
  // Use Vite proxy path to avoid CORS
  const url = "/api/anthropic/v1/messages";

  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;
  headers["anthropic-version"] = "2023-06-01";

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            {
              type: "text",
              text: `You are a guitar tab extraction expert. Extract ALL guitar tablature from this image.

Output ONLY raw tab text. No explanation, no markdown code blocks, no extra commentary.

Rules:
- Use exactly this line format: X|---data---|  where X is the string letter
- Use lowercase e for high E string, uppercase E for low E string
- Preserve ALL fret numbers exactly as shown
- Preserve ALL technique symbols: h (hammer-on), p (pull-off), b (bend), r (release), / (slide up), \\ (slide down), x (mute), ~ (vibrato), t (tap)
- Preserve harmonics in angle brackets like <12>
- Preserve ghost notes in parentheses like (5)
- Use dashes for unplayed positions
- Separate multiple sections with a blank line
- Ignore chord names, lyrics, or other non-tab text above the staff
- Output ONLY the tab lines, nothing else`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API returned ${res.status}`);
  }

  const data = await res.json();
  const text = data.content
    ?.filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  if (!text) throw new Error("No tab data could be extracted from this image");
  return text.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
}
