import { TBaseTimestamps } from "./base.type";
import { TReactionType } from "./reactioin.type";
import { TUser } from "./user.type";

export type TArticle = {
    id: string;
    title?: string;
    content: string;
    imageUrl: string;
    viewCount: number;
    commentCount: number;
    likeCount?: number;
    dislikeCount?: number;
    angryCount?: number;
    userId: string;
    isPublish: boolean;
    edges: {
        Users: TUser;
        user?: TUser;
    };
    reaction: TReactionType | null;
} & TBaseTimestamps;
