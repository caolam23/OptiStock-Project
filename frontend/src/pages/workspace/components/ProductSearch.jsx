import React, { useState, useRef, useCallback } from 'react';
import { AutoComplete, Tag, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchProducts, createDebouncedSearch } from '../../../api/productApi';
import styles from './ProductSearch.module.css';

/**
 * ProductSearch Component - Thanh tìm kiếm sản phẩm thông minh với auto-suggest
 * 
 * Props:
 *  - tenantId (string, required): ID của workspace
 *  - onSearch (function, required): Callback khi user ấn Enter hoặc chọn gợi ý
 *  - placeholder (string, optional): Placeholder text của input
 *  - maxResults (number, optional, default: 10): Số lượng gợi ý tối đa
 * 
 * Features:
 *  - Tìm kiếm theo tên sản phẩm hoặc mã SKU
 *  - Debounce 300ms để tối ưu API calls
 *  - Custom render options với Tag danh mục cho tên sản phẩm
 *  - Highlight mã SKU khi match
 */
const ProductSearch = ({ 
    tenantId, 
    onSearch, 
    placeholder = 'Tìm theo mã SKU hoặc tên sản phẩm...',
    maxResults = 10
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const debouncedSearchRef = useRef(null);

    // ========== Initialize Debounced Search Function ==========
    React.useEffect(() => {
        // Tạo hàm debounced search
        debouncedSearchRef.current = createDebouncedSearch(
            async (keyword) => {
                if (!keyword || !keyword.trim()) {
                    setSuggestions([]);
                    return;
                }

                try {
                    setLoading(true);
                    const results = await searchProducts(tenantId, keyword, maxResults);
                    
                    // Transform results thành options format cho AutoComplete
                    const options = results.map((product) => ({
                        value: product.id, // ID của sản phẩm
                        label: renderOptionLabel(product, keyword),
                        product: product, // Lưu product object để dùng trong onSearch
                        // Thêm fields để giúp sorting/filtering
                        name: product.productName,
                        code: product.productCode,
                        category: product.category,
                    }));

                    setSuggestions(options);
                } catch (error) {
                    console.error('Lỗi tìm kiếm:', error);
                    setSuggestions([]);
                } finally {
                    setLoading(false);
                }
            },
            300 // Debounce delay: 300ms
        );
    }, [tenantId, maxResults]);

    // ========== Handle Input Change ==========
    const handleInputChange = useCallback((value) => {
        setInputValue(value);
        
        if (!value || !value.trim()) {
            setSuggestions([]);
            return;
        }

        // Gọi debounced search
        if (debouncedSearchRef.current) {
            debouncedSearchRef.current(value);
        }
    }, []);

    // ========== Handle Option Select ==========
    const handleSelect = useCallback((value, option) => {
        // Gọi onSearch callback với product object
        if (onSearch && option.product) {
            onSearch(option.product);
        }
        // Clear input
        setInputValue('');
        setSuggestions([]);
    }, [onSearch]);

    // ========== Handle Enter Key ==========
    const handlePressEnter = useCallback(() => {
        if (inputValue.trim() && onSearch) {
            // Gọi search với keyword thay vì product object
            onSearch({
                type: 'keyword',
                keyword: inputValue.trim()
            });
        }
        // Clear input
        setInputValue('');
        setSuggestions([]);
    }, [inputValue, onSearch]);

    // ========== Render Custom Option Label ==========
    const renderOptionLabel = (product, keyword) => {
        const keyword_lower = (keyword || '').trim().toLowerCase();
        const code_match = product.productCode?.toLowerCase().includes(keyword_lower);
        const name_match = product.productName?.toLowerCase().includes(keyword_lower);

        return (
            <div className={styles.optionContainer}>
                {/* Nếu match theo mã SKU, hiển thị mã SKU */}
                {code_match && !name_match && (
                    <div className={styles.optionContent}>
                        <span className={styles.codeHighlight}>
                            <strong>{product.productCode}</strong>
                        </span>
                    </div>
                )}

                {/* Nếu match theo tên hoặc match cả hai, hiển thị tên + tag danh mục */}
                {name_match && (
                    <div className={styles.optionContent}>
                        <span className={styles.nameHighlight}>
                            <strong>{product.productName}</strong>
                        </span>
                        {product.category && (
                            <Tag 
                                color="blue" 
                                className={styles.categoryTag}
                            >
                                {product.category}
                            </Tag>
                        )}
                        <span className={styles.skuCode}>
                            ({product.productCode})
                        </span>
                    </div>
                )}

                {/* Fallback: nếu không match được (không nên tới đây) */}
                {!code_match && !name_match && (
                    <div className={styles.optionContent}>
                        <span>{product.productName}</span>
                        {product.category && (
                            <Tag color="blue">{product.category}</Tag>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.searchContainer}>
            <AutoComplete
                value={inputValue}
                options={suggestions}
                onSelect={handleSelect}
                onSearch={handleInputChange}
                loading={loading}
                allowClear
                className={styles.autoComplete}
                classNames={{
                    popup: styles.autoCompleteDropdown
                }}
                notFoundContent={
                    inputValue.trim() && !loading ? (
                        <div className={styles.noResults}>
                            Không tìm thấy sản phẩm nào
                        </div>
                    ) : null
                }
            >
                <Input
                    placeholder={placeholder}
                    prefix={<SearchOutlined className={styles.searchIcon} />}
                    onPressEnter={handlePressEnter}
                    className={styles.searchInput}
                    size="large"
                />
            </AutoComplete>
        </div>
    );
};

export default ProductSearch;
