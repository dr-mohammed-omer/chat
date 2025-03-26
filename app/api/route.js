import Replicate from "replicate";
import { ReplicateStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const VERSIONS = {
  "yorickvp/llava-13b":
    "e272157381e2a3bf12df3a8edd1f38d1dbd736bbb7437277c8b34175f8fce358",
  "nateraw/salmonn":
    "ad1d3f9d2bd683628242b68d890bef7f7bd97f738a7c2ccbf1743a594c723d83",
};

export async function POST(req) {
  try {
    const params = await req.json();
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");

    // Get API token safely
    const apiToken =
      process.env.REPLICATE_API_TOKEN || params.replicateApiToken;

    if (!apiToken) {
      console.error("Missing API Token!");
      return new Response(
        JSON.stringify({ error: "Server error: Missing API Token" }),
        { status: 500 }
      );
    }

    const replicateClient = new Replicate({
      auth: apiToken,
      userAgent: "llama-chat",
    });

    if (!ip) {
      console.error("IP address is null");
      return new Response("IP address could not be retrieved", { status: 500 });
    }

    let response;
    if (params.image) {
      response = await runLlava(replicateClient, params);
    } else if (params.audio) {
      response = await runSalmonn(replicateClient, params);
    } else {
      response = await runLlama(replicateClient, params);
    }

    // Convert the response into a friendly text-stream
    const stream = await ReplicateStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

async function runLlama(
  replicateClient,
  { model, prompt, maxTokens, temperature, topP }
) {
  console.log("running llama", model);

  return await replicateClient.predictions.create({
    model,
    stream: true,
    input: {
      prompt,
      max_tokens: maxTokens,
      temperature,
      repetition_penalty: 1,
      top_p: topP,
    },
  });
}

async function runLlava(
  replicateClient,
  { prompt, maxTokens, temperature, topP, image }
) {
  console.log("running llava");

  return await replicateClient.predictions.create({
    stream: true,
    input: {
      prompt,
      top_p: topP,
      temperature,
      max_tokens: maxTokens,
      image,
    },
    version: VERSIONS["yorickvp/llava-13b"],
  });
}

async function runSalmonn(
  replicateClient,
  { prompt, maxTokens, temperature, topP, audio }
) {
  console.log("running salmonn");

  return await replicateClient.predictions.create({
    stream: true,
    input: {
      prompt,
      top_p: topP,
      temperature,
      max_length: maxTokens,
      wav_path: audio,
    },
    version: VERSIONS["nateraw/salmonn"],
  });
}
