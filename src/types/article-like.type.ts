import { TBaseTimestamps } from "./base.type";

export type TArticleLike = {
    id: number;
    articleId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    // edges: {};
} & TBaseTimestamps;
