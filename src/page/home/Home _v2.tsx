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
import { useDisclosure } from "@mantine/hooks";
import { IconThumbUp, IconThumbUpFilled } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid, VirtuosoGridHandle } from "react-virtuoso";


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

function ArticleVoteActions({
    article,
    liked,
    onToggleLike,
}: {
    article: TArticle;
    liked: boolean;
    onToggleLike: (liked: boolean) => void;
}) {
    const toggleArticleLike = useToggleArticleLike();
    const queryClient = useQueryClient();
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
        <div className="home-v2-actions">
            <Button
                className="home-v2-action-button"
                variant={liked ? "filled" : "light"}
                leftSection={liked ? <IconThumbUpFilled size={18} /> : <IconThumbUp size={18} />}
                onClick={handleToggleLike}
            >
                Thích
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
    const [liked, setLiked] = useState(false);
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
        <Paper component="article" className="home-v2-card" radius="lg">
            <button className="home-v2-card-button" onClick={handleOpenArticle} type="button">
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

                    <Title order={3} lineClamp={2} fz="h3" lh={1.25} className="home-v2-title">
                        {getArticleTitle(article)}
                    </Title>

                    <Text c="dimmed" lineClamp={1} className="home-v2-content">
                        {article.content}
                    </Text>
                </Stack>

                <div className="home-v2-media">
                    {article.imageUrl ? (
                        <Image src={checkPathImage(article.imageUrl)} alt={getArticleTitle(article)} />
                    ) : (
                        <div className="home-v2-media-fallback">Chưa có hình ảnh</div>
                    )}
                </div>

                <Group justify="space-between" px={16} py={12} c="dimmed" fz="sm">
                    <Group gap={6}>
                        <IconThumbUp size={17} />
                        <Text fz="sm">{likeCount} lượt thích</Text>
                    </Group>
                </Group>
            </button>

            <ArticleVoteActions article={article} liked={liked} onToggleLike={handleToggleLike} />
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
        <Box className="home-v2-page">
            <Stack gap={18} className="home-v2-viewport">
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
                        listClassName="home-v2-grid"
                        itemClassName="home-v2-grid-item"
                        computeItemKey={(_, article) => article.id}
                        itemContent={(i, article: TArticle) => (
                            <ArticleGridCard key={article.id || i} article={article} handleModalArticleDetail={handleModalArticleDetail} />
                        )}
                        endReached={handleEndReached}
                        components={{
                            Footer: () =>
                                getAllArticle.isFetching && articles.length > 0 ? (
                                    <Center className="home-v2-footer">
                                        <Loader size="sm" />
                                    </Center>
                                ) : null,
                        }}
                    />
                </DataStateWrapper>
            </Stack>

            <ModalArticleDetail opened={openedModalAticleDetail} close={handleModalArticleDetail.close} />
            <style jsx global>{`
                .home-v2-page {
                    min-height: calc(100vh - var(--height-header));
                    padding: 24px;
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0)),
                        var(--mantine-color-body);
                }

                .home-v2-viewport {
                    position: relative;
                    height: calc(100vh - var(--height-header) - 48px);
                }

                .home-v2-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 18px;
                    align-items: stretch;
                    padding-bottom: 18px;
                }

                .home-v2-grid-item {
                    min-width: 0;
                }

                .home-v2-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 420px;
                    overflow: hidden;
                    border: 1px solid var(--mantine-color-default-border);
                    background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
                    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
                }

                .home-v2-card-button {
                    flex: 1;
                    min-width: 0;
                    height: auto;
                    padding: 0;
                    color: inherit;
                    text-align: left;
                    background: transparent;
                    border: 0;
                    cursor: pointer;
                }

                .home-v2-card-button:focus-visible {
                    outline: 2px solid var(--mantine-primary-color-filled);
                    outline-offset: -2px;
                }

                .home-v2-title {
                    min-height: calc(2em * 1.25);
                }

                .home-v2-content {
                    min-height: 1.55em;
                    overflow-wrap: break-word;
                }

                .home-v2-media {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    overflow: hidden;
                    background: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6));
                }

                .home-v2-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .home-v2-media-fallback {
                    display: grid;
                    width: 100%;
                    height: 100%;
                    place-items: center;
                    color: var(--mantine-color-dimmed);
                    font-weight: 600;
                }

                .home-v2-actions {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                    padding: 12px;
                    border-top: 1px solid var(--mantine-color-default-border);
                }

                .home-v2-action-button {
                    min-width: 0;
                    border-radius: 8px;
                }

                .home-v2-footer {
                    padding: 18px 0 4px;
                }

                @media (max-width: 48em) {
                    .home-v2-page {
                        padding: 14px;
                    }

                    .home-v2-viewport {
                        height: calc(100vh - var(--height-header) - 28px);
                    }

                    .home-v2-grid {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }

                    .home-v2-card {
                        min-height: 380px;
                    }
                }
            `}</style>
        </Box>
    );
}
