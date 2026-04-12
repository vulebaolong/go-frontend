import { TBaseTimestamps } from "./base.type";
import { TUser } from "./user.type";

export type TArticle = {
    id: number;
    title?: string;
    content: string;
    imageUrl: string;
    likeCount: number;
    views: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    edges: {
        Users: TUser;
    };
} & TBaseTimestamps;
