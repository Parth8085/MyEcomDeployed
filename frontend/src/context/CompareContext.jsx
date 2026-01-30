import { createContext, useState, useContext, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            setCompareList(JSON.parse(saved));
        }
    }, []);

    const addToCompare = (product) => {
        if (compareList.find(p => p.id === product.id)) return;
        if (compareList.length >= 3) {
            alert("You can only compare up to 3 products.");
            return;
        }

        // Enforce same category comparison
        if (compareList.length > 0 && compareList[0].category !== product.category) {
            alert(`Only same category is allowed! You are comparing ${compareList[0].category}, but tried to add ${product.category}.`);
            return;
        }

        const newList = [...compareList, product];
        setCompareList(newList);
        localStorage.setItem('compareList', JSON.stringify(newList));
    };

    const removeFromCompare = (productId) => {
        const newList = compareList.filter(p => p.id !== productId);
        setCompareList(newList);
        localStorage.setItem('compareList', JSON.stringify(newList));
    };

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => useContext(CompareContext);
