"use client";

import { useGetAllArticle, useToggleArticleLike } from "@/api/tantask/article.tanstack";
import Avatar from "@/components/avatar/Avatar";
import { DataStateWrapper } from "@/components/data-state-wrapper/DataStateWrapper";
import ModalArticleDetail from "@/components/modal/modal-article-detail/ModalArticleDetail";
import ArticleSkeleton from "@/components/skeletons/ArticleSkeleton";
import { checkPathImage, formatLocalTime, resError } from "@/helpers/function.helper";
import { useAppDispatch } from "@/redux/hooks";
import { SET_ARTICLE_DETAIL } from "@/redux/slices/article.slice";
import { TArticle } from "@/types/article.type";
import { Box, Button, Center, Group, Image, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconThumbUp, IconThumbUpFilled } from "@tabler/icons-react";
import { CSSProperties, forwardRef, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid, VirtuosoGridHandle } from "react-virtuoso";
import type { GridItemProps, GridListProps } from "react-virtuoso";

function getArticleTitle(article: TArticle) {
    const fallbackTitle = article.content?.split("\n").find(Boolean)?.trim();
    return article.title || fallbackTitle || "Bài viết";
}

function getArticleAuthor(article: TArticle) {
    return article.edges.Users;
}

function getReactionCount(article: TArticle) {
    return article.likeCount || 0;
}

function ArticleVoteActions({ article, liked, onToggleLike }: { article: TArticle; liked: boolean; onToggleLike: (liked: boolean) => void }) {
    const toggleArticleLike = useToggleArticleLike();
    const committedLikedRef = useRef(false);
    const pendingLikedRef = useRef(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    const sendLastLikeSignal = (nextLiked: boolean) => {
        pendingLikedRef.current = nextLiked;

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            const finalLiked = pendingLikedRef.current;
            if (finalLiked === committedLikedRef.current) return;

            toggleArticleLike.mutate(article.id, {
                onSuccess: () => {
                    committedLikedRef.current = finalLiked;
                    // queryClient.invalidateQueries({ queryKey: ["get-all-article"] });
                },
                onError: (error) => {
                    onToggleLike(committedLikedRef.current);
                    pendingLikedRef.current = committedLikedRef.current;
                    toast.error(resError(error, "Toggle Like Failed"));
                },
            });
        }, 500);
    };

    const handleToggleLike = () => {
        const nextLiked = !liked;
        onToggleLike(nextLiked);
        sendLastLikeSignal(nextLiked);
    };

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8,
                padding: 12,
                borderTop: "1px solid var(--mantine-color-default-border)",
            }}
        >
            <Button
                sx={{ minWidth: 0, borderRadius: 8 }}
                variant={liked ? "filled" : "light"}
                leftSection={liked ? <IconThumbUpFilled size={18} /> : <IconThumbUp size={18} />}
                onClick={handleToggleLike}
            >
                Thích
            </Button>
        </Box>
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
    const [liked, setLiked] = useState((article.edges.ArticleLikes?.length || 0) > 0);
    const [likeCount, setLikeCount] = useState(getReactionCount(article));

    useEffect(() => {
        setLikeCount(getReactionCount(article));
    }, [article.likeCount]);

    const handleOpenArticle = () => {
        dispatch(SET_ARTICLE_DETAIL(article));
        handleModalArticleDetail.open();
    };

    const handleToggleLike = (nextLiked: boolean) => {
        setLiked((prevLiked) => {
            setLikeCount((prevCount) => {
                if (prevLiked === nextLiked) return prevCount;
                return Math.max(0, prevCount + (nextLiked ? 1 : -1));
            });
            return nextLiked;
        });
    };

    return (
        <Paper
            component="article"
            radius="lg"
            sx={(_, u) => ({
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 420,
                overflow: "hidden",
                border: "1px solid var(--mantine-color-default-border)",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.12)",
                [u.light]: {
                    background: "var(--mantine-color-white)",
                },
                [u.dark]: {
                    background: "var(--mantine-color-dark-7)",
                },
            })}
        >
            <Box
                component="button"
                onClick={handleOpenArticle}
                type="button"
                sx={{
                    flex: 1,
                    minWidth: 0,
                    height: "auto",
                    padding: 0,
                    color: "inherit",
                    textAlign: "left",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    "&:focus-visible": {
                        outline: "2px solid var(--mantine-primary-color-filled)",
                        outlineOffset: -2,
                    },
                }}
            >
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

                    <Title order={3} lineClamp={2} fz="h3" lh={1.25} style={{ minHeight: "calc(2em * 1.25)" }}>
                        {getArticleTitle(article)}
                    </Title>

                    <Text c="dimmed" lineClamp={1} style={{ minHeight: "1.55em", overflowWrap: "break-word" }}>
                        {article.content}
                    </Text>
                </Stack>

                <Box
                    sx={(_, u) => ({
                        width: "100%",
                        aspectRatio: "16 / 9",
                        overflow: "hidden",
                        [u.light]: {
                            background: "var(--mantine-color-gray-1)",
                        },
                        [u.dark]: {
                            background: "var(--mantine-color-dark-6)",
                        },
                    })}
                >
                    {article.imageUrl ? (
                        <Image
                            src={checkPathImage(article.imageUrl)}
                            alt={getArticleTitle(article)}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <Center w="100%" h="100%" c="dimmed" fw={600}>
                            Chưa có hình ảnh
                        </Center>
                    )}
                </Box>

                <Group justify="space-between" px={16} py={12} c="dimmed" fz="sm">
                    <Group gap={6}>
                        <IconThumbUp size={17} />
                        <Text fz="sm">{likeCount} lượt thích</Text>
                    </Group>
                </Group>
            </Box>

            <ArticleVoteActions article={article} liked={liked} onToggleLike={handleToggleLike} />
        </Paper>
    );
}

export default function Home_v2() {
    const totalPageRef = useRef(0);
    const [openedModalAticleDetail, handleModalArticleDetail] = useDisclosure(false);
    const [page, setPage] = useState(1);
    const [articles, setArticles] = useState<TArticle[]>([]);
    const isMobile = useMediaQuery("(max-width: 48em)");

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

    const listStyle: CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
        gap: isMobile ? 14 : 18,
        alignItems: "stretch",
        paddingBottom: 18,
    };

    const GridList = forwardRef<HTMLDivElement, GridListProps>(({ style, ...props }, ref) => (
        <div {...props} ref={ref} style={{ ...style, ...listStyle }} />
    ));
    GridList.displayName = "ArticleGridList";

    const GridItem = forwardRef<HTMLDivElement, GridItemProps>(({ style, ...props }, ref) => (
        <div {...props} ref={ref} style={{ ...style, minWidth: 0 }} />
    ));
    GridItem.displayName = "ArticleGridItem";

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - var(--height-header))",
                padding: isMobile ? 14 : 24,
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0)), var(--mantine-color-body)",
            }}
        >
            <Stack gap={18} style={{ position: "relative", height: `calc(100vh - var(--height-header) - ${isMobile ? 28 : 48}px)` }}>
                {/* <Box>
                    <Title order={2}>Bài viết mới nhất</Title>
                    <Text c="dimmed">Khám phá các bài viết được chia sẻ gần đây.</Text>
                </Box> */}

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
                        computeItemKey={(_, article) => article.id}
                        itemContent={(i, article: TArticle) => (
                            <ArticleGridCard key={article.id || i} article={article} handleModalArticleDetail={handleModalArticleDetail} />
                        )}
                        endReached={handleEndReached}
                        components={{
                            List: GridList,
                            Item: GridItem,
                            Footer: () =>
                                getAllArticle.isFetching && articles.length > 0 ? (
                                    <Center style={{ padding: "18px 0 4px" }}>
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
