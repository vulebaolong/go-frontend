"use client";

import { useGetAllArticle } from "@/api/tantask/article.tanstack";
import { useCreateReactionArticle } from "@/api/tantask/reaction.tanstack";
import Avatar from "@/components/avatar/Avatar";
import { DataStateWrapper } from "@/components/data-state-wrapper/DataStateWrapper";
import ModalArticleDetail from "@/components/modal/modal-article-detail/ModalArticleDetail";
import ArticleSkeleton from "@/components/skeletons/ArticleSkeleton";
import { checkPathImage, formatLocalTime, resError } from "@/helpers/function.helper";
import { useAppDispatch } from "@/redux/hooks";
import { SET_ARTICLE_DETAIL } from "@/redux/slices/article.slice";
import { TArticle } from "@/types/article.type";
import { TReactionType } from "@/types/reactioin.type";
import { Box, Button, Center, Group, Image, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid, VirtuosoGridHandle } from "react-virtuoso";
import classes from "./HomeV2.module.css";

function getArticleAuthor(article: TArticle) {
    return article.edges.Users || article.edges.user;
}

function getArticleTitle(article: TArticle) {
    const fallbackTitle = article.content?.split("\n").find(Boolean)?.trim();
    return article.title || fallbackTitle || "Bài viết";
}

function getReactionCount(article: TArticle, type: "like" | "dislike") {
    if (type === "like") return article.likeCount || 0;
    return article.dislikeCount || article.angryCount || 0;
}

function ArticleVoteActions({ article }: { article: TArticle }) {
    const [reactionType, setReactionType] = useState<TArticle["reaction"]>(article.reaction);
    const createReactionArticle = useCreateReactionArticle();

    const sendReaction = useDebouncedCallback((type: TReactionType) => {
        createReactionArticle.mutate(
            {
                targetId: article.id,
                targetType: "article",
                type,
            },
            {
                onSuccess: (data) => {
                    setReactionType(data?.type || type);
                },
                onError: (error) => {
                    setReactionType(article.reaction);
                    toast.error(resError(error, "Create Reaction Failed"));
                },
            },
        );
    }, 300);

    const handleReaction = (type: TReactionType) => {
        setReactionType(type);
        sendReaction(type);
    };

    return (
        <div className={classes.actions}>
            <Button
                className={classes.actionButton}
                variant={reactionType === "like" ? "filled" : "light"}
                leftSection={<IconThumbUp size={18} />}
                onClick={() => handleReaction("like")}
                loading={createReactionArticle.isPending && reactionType === "like"}
            >
                Thích
            </Button>
            <Button
                className={classes.actionButton}
                variant={reactionType === "angry" ? "filled" : "light"}
                color="red"
                leftSection={<IconThumbDown size={18} />}
                onClick={() => handleReaction("angry")}
                loading={createReactionArticle.isPending && reactionType === "angry"}
            >
                Không thích
            </Button>
        </div>
    );
}

function ArticleGridCard({
    article,
    handleModalArticleDetail,
}: {
    article: TArticle;
    handleModalArticleDetail: {
        readonly open: () => void;
        readonly close: () => void;
        readonly toggle: () => void;
    };
}) {
    const dispatch = useAppDispatch();
    const author = getArticleAuthor(article);

    const handleOpenArticle = () => {
        dispatch(SET_ARTICLE_DETAIL(article));
        handleModalArticleDetail.open();
    };

    return (
        <Paper component="article" className={classes.card} radius="lg">
            <button className={classes.cardButton} onClick={handleOpenArticle} type="button">
                <Stack gap={14} p={16}>
                    <Group gap={10} wrap="nowrap">
                        <Avatar fullName={author?.fullName} avatar={author?.avatar} size={42} />
                        <Box style={{ minWidth: 0 }}>
                            <Text fw={700} truncate>
                                {author?.fullName || "Người dùng"}
                            </Text>
                            <Text c="dimmed" fz="sm">
                                {formatLocalTime(article.createdAt, "ago")}
                            </Text>
                        </Box>
                    </Group>

                    <Title order={3} lineClamp={2} fz="h3" lh={1.25} className={classes.title}>
                        {getArticleTitle(article)}
                    </Title>

                    <Text c="dimmed" lineClamp={1} className={classes.content}>
                        {article.content}
                    </Text>
                </Stack>

                <div className={classes.media}>
                    {article.imageUrl ? (
                        <Image src={checkPathImage(article.imageUrl)} alt={getArticleTitle(article)} />
                    ) : (
                        <div className={classes.mediaFallback}>Chưa có hình ảnh</div>
                    )}
                </div>

                <Group justify="space-between" px={16} py={12} c="dimmed" fz="sm">
                    <Group gap={6}>
                        <IconThumbUp size={17} />
                        <Text fz="sm">{getReactionCount(article, "like")} lượt thích</Text>
                    </Group>
                    <Group gap={6}>
                        <IconThumbDown size={17} />
                        <Text fz="sm">{getReactionCount(article, "dislike")} không thích</Text>
                    </Group>
                </Group>
            </button>

            <ArticleVoteActions article={article} />
        </Paper>
    );
}

export default function Home_v2() {
    const totalPageRef = useRef(0);
    const [openedModalAticleDetail, handleModalArticleDetail] = useDisclosure(false);
    const [page, setPage] = useState(1);
    const [articles, setArticles] = useState<TArticle[]>([]);

    const virtuosoRef = useRef<VirtuosoGridHandle>(null);
    const pageSize = 10;

    const getAllArticle = useGetAllArticle({
        pagination: { page: page, pageSize },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });

    useEffect(() => {
        if (!getAllArticle.data?.items) return;
        setArticles((prev) => {
            const nextArticles = getAllArticle.data.items;
            if (page === 1) return nextArticles;

            const prevIds = new Set(prev.map((article) => article.id));
            return [...prev, ...nextArticles.filter((article) => !prevIds.has(article.id))];
        });
    }, [getAllArticle.data?.items, page]);

    useEffect(() => {
        if (getAllArticle.data?.totalPage) totalPageRef.current = getAllArticle.data.totalPage;
    }, [getAllArticle.data?.totalPage]);

    const handleEndReached = () => {
        if (getAllArticle.isFetching || page >= totalPageRef.current) return;
        setPage((prev) => prev + 1);
    };

    return (
        <Box className={classes.page}>
            <Stack gap={18} className={classes.viewport}>
                <Box>
                    <Title order={2}>Bài viết mới nhất</Title>
                    <Text c="dimmed">Khám phá các bài viết được chia sẻ gần đây.</Text>
                </Box>

                <DataStateWrapper
                    isLoading={getAllArticle.isLoading && articles.length === 0}
                    isError={getAllArticle.isError}
                    isEmpty={!getAllArticle.isFetching && articles.length === 0}
                    loadingComponent={<ArticleSkeleton />}
                >
                    <VirtuosoGrid
                        ref={virtuosoRef}
                        data={articles}
                        style={{ height: "100%" }}
                        listClassName={classes.grid}
                        itemClassName={classes.gridItem}
                        computeItemKey={(_, article) => article.id}
                        itemContent={(i, article: TArticle) => (
                            <ArticleGridCard key={article.id || i} article={article} handleModalArticleDetail={handleModalArticleDetail} />
                        )}
                        endReached={handleEndReached}
                        components={{
                            Footer: () =>
                                getAllArticle.isFetching && articles.length > 0 ? (
                                    <Center className={classes.footer}>
                                        <Loader size="sm" />
                                    </Center>
                                ) : null,
                        }}
                    />
                </DataStateWrapper>
            </Stack>

            <ModalArticleDetail opened={openedModalAticleDetail} close={handleModalArticleDetail.close} />
        </Box>
    );
}
