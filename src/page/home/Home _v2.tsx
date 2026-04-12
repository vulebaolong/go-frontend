"use client";

import { useGetAllArticle } from "@/api/tantask/article.tanstack";
import Article from "@/components/article/Article";
import { DataStateWrapper } from "@/components/data-state-wrapper/DataStateWrapper";
import ArticleSkeleton from "@/components/skeletons/ArticleSkeleton";
import { TArticle } from "@/types/article.type";
import { Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

export default function Home_v2() {
    const totalPageRef = useRef(0);
    const [openedModalAticleDetail, handleModalArticleDetail] = useDisclosure(false);
    const [page, setPage] = useState(1); // CHỈNH: Thay vì const [page]
    const [articles, setArticles] = useState<TArticle[]>([]);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const pageSize = 10; // số bài mỗi lần load

    const getAllArticle = useGetAllArticle({
        pagination: { page: page, pageSize },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });

    // Khi fetch thành công, append articles vào cuối mảng
    useEffect(() => {
        if (!getAllArticle.data?.items) return;
        setArticles((prev) => {
            const articles = getAllArticle.data.items;
            if (prev.length === 0) return articles;
            return [...articles, ...prev];
        });
    }, [getAllArticle.data?.items, page]);

    const handleEndReached = () => {
        if (getAllArticle.isFetching || page >= totalPageRef.current) return;
        setPage((prev) => prev + 1);
    };

    return (
        <>
            <Stack style={{ position: "relative", height: 100 }}>
                <DataStateWrapper
                    isLoading={getAllArticle.isLoading || getAllArticle.isFetching}
                    isError={getAllArticle.isError}
                    isEmpty={!getAllArticle.data || getAllArticle.data.items?.length === 0}
                    loadingComponent={<ArticleSkeleton />}
                >
                    <Virtuoso
                        ref={virtuosoRef}
                        data={articles}
                        style={{ height: "100%" }}
                        itemContent={(i, article: TArticle) => (
                            <Article key={i} article={article} handleModalArticleDetail={handleModalArticleDetail} />
                        )}
                        endReached={handleEndReached}
                    />
                </DataStateWrapper>
            </Stack>

            {/* <ModalArticleDetail opened={openedModalAticleDetail} close={handleModalArticleDetail.close} /> */}
        </>
    );
}
