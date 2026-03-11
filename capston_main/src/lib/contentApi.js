import { supabase } from "./supabaseClient";

const CONTENT_ID = "capstone_main";

export async function fetchRemoteContent() {
  const { data, error } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("id", CONTENT_ID)
    .single();

  if (error) {
    console.error("fetchRemoteContent error:", error);
    throw error;
  }

  return data?.content_json ?? null;
}

export async function saveRemoteContent(content) {
  const { data, error } = await supabase
    .from("site_content")
    .upsert(
      {
        id: CONTENT_ID,
        content_json: content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select();

  if (error) {
    console.error("saveRemoteContent error:", error);
    throw error;
  }

  return data;
}