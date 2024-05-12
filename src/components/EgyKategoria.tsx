import React, { FC, useEffect, useReducer, useState, MouseEvent } from 'react';
import { Text, Flex, Button } from '@chakra-ui/react';
import { useParams, useSearchParams } from "react-router-dom";
import { Product } from '../model';
import { ProductsState, ProductSortType } from '../state';
import { ProductsStateReducer, productsReducer } from '../state/productsReducer';
import { useWebshopApi } from '../state/useWebshopApi';
import { ProductSearchParams } from '../state/productsState';
import { ProductListElement } from './products/ProductListElement';
import { off } from 'process';

export const INITIAL_STATE: ProductsState = {
    products: [],
    total: 0,
    categories: ["cameras-photos"],
    orderBy: ProductSortType.NAME_ASC,
    offset: 0,
    limit: 6
};

export const EgyKategoria: FC = () => {
    const { categoryId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [productsState, productsDispatch] = useReducer<ProductsStateReducer>(productsReducer, INITIAL_STATE)

    const [pageCount, setPageCount] = useState(1);

    const { getProducts } = useWebshopApi();

    useEffect(() => {
        loadProducts()
    }, []);

    const loadProducts = async () => {
        const defaultQuery: ProductSearchParams = {
            limit: INITIAL_STATE.limit,
            offset: INITIAL_STATE.offset,
            orderBy: INITIAL_STATE.orderBy,
            categories: categoryId? [categoryId]:[]
        }
        const _productsData = await getProducts(defaultQuery);
        console.log(_productsData);
        productsDispatch({ type: 'setResults', payload: _productsData });
    }

    const handleKovetkezoOldal = (e: MouseEvent<HTMLButtonElement>) => {
        const newOldal = pageCount + 1
        if ((newOldal - 1) * 6 >= productsState.total) return;
        setPageCount(newOldal)

        const newOffset = (newOldal - 1) * 6
        productsDispatch({ type: 'changeOffset', payload: { offset: newOffset } })
        reloadProducts(newOffset)
    }

    const handleElozoOldal = (e: MouseEvent<HTMLButtonElement>) => {
        const newOldal = pageCount - 1
        if (newOldal < 1) return;
        setPageCount(newOldal)

        const newOffset = (newOldal - 1) * 6
        productsDispatch({ type: 'changeOffset', payload: { offset: newOffset } })
        reloadProducts(newOffset)
    }

    const reloadProducts = async (offset: number) => {
        const query: ProductSearchParams = {
            limit: INITIAL_STATE.limit,
            offset: offset,
            orderBy: productsState.orderBy,
            categories: categoryId? [categoryId]:[]
        }
        const _productsData = await getProducts(query);
        console.log(_productsData);
        productsDispatch({ type: 'setResults', payload: _productsData });
    }




    return (
        <>
            <Text>Összes termék ebben a kategóriában: {productsState.total}db</Text>
            <Text>Oldal: {pageCount}</Text>

            <Button onClick={handleElozoOldal}>Előző</Button>
            <Button onClick={handleKovetkezoOldal}>Következő</Button>
            <Flex flexWrap="wrap" justifyContent="center">
                {
                    productsState.products.map((productData, index) =>
                        <ProductListElement key={index} {...productData} />
                    )
                }
            </Flex>
        </>
    );
}