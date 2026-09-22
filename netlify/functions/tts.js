// netlify/functions/tts.js
//
// Mirrors your existing chat.js function pattern: the browser can't hold your
// ElevenLabs API key, so this function holds it server-side and proxies the
// text-to-speech request.
//
// Setup:
// 1. In your Netlify site settings, add an environment variable:
//      ELEVENLABS_API_KEY = <your ElevenLabs API key>
//      ELEVENLABS_VOICE_ID = <the voice ID for "Mark" in your ElevenLabs account>
//    (Voice IDs are found on the Voice Library / My Voices page in ElevenLabs —
//    click a voice and copy its ID, since "Mark" isn't a fixed ID across accounts.)
// 2. Place this file at netlify/functions/tts.js in your repo.
// 3. Redeploy.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text || typeof text !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'text' in request body." }),
      };
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey || !voiceId) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Server is missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID.",
        }),
      };
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "ElevenLabs error: " + errText }),
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    return {
      statusCode: 200,
      headers: { "Content-Type": "audio/mpeg" },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
