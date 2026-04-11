"use server";

import { ENDPOINT } from "@/constant/endpoint.constant";
import { TRes, TResAction, TResPagination } from "@/types/app.type";
import { TAllmessage } from "@/types/chat.type";
import api from "../core.api";

export async function getGetChatMessageAction(query: string, chatGroupId?: string): Promise<TResAction<TResPagination<TAllmessage> | null>> {
   try {
      const result = await api.get<TRes<TResPagination<TAllmessage>>>(`${ENDPOINT.CHAT_MESSAGE}?${query}`, {
         headers: chatGroupId ? { "chat-group-id": chatGroupId } : {},
      });
      const { data } = result;
      return { status: "success", message: result.message, data: data };
   } catch (error: any) {
      return { status: "error", message: error?.message, data: null };
   }
}
