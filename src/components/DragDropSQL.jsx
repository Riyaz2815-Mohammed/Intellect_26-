import React, { useState } from 'react';

const DragDropSQL = ({ fragments, onSubmit }) => {
    // Map fragments to objects with unique IDs to handle duplicates like "COUNT(*)"
    const prepareFragments = (list) => list.map((text, idx) => ({ id: `frag-${idx}`, text }));

    const [availableFragments, setAvailableFragments] = useState(prepareFragments(fragments));
    const [orderedFragments, setOrderedFragments] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when fragments prop changes (e.g. next stage)
    React.useEffect(() => {
        setAvailableFragments(prepareFragments(fragments));
        setOrderedFragments([]);
        setDraggedItem(null);
    }, [fragments]);

    const handleItemClick = (fragmentObj, source) => {
        if (source === 'available') {
            setAvailableFragments(prev => prev.filter(f => f.id !== fragmentObj.id));
            setOrderedFragments(prev => [...prev, fragmentObj]);
        } else if (source === 'ordered') {
            setOrderedFragments(prev => prev.filter(f => f.id !== fragmentObj.id));
            setAvailableFragments(prev => [...prev, fragmentObj]);
        }
    };

    const handleDragStart = (e, fragmentObj, source) => {
        setDraggedItem({ fragmentObj, source });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropToOrdered = (e, index) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { fragmentObj, source } = draggedItem;

        if (source === 'available') {
            setAvailableFragments(prev => prev.filter(f => f.id !== fragmentObj.id));
            setOrderedFragments(prev => {
                const newOrdered = [...prev];
                newOrdered.splice(index, 0, fragmentObj);
                return newOrdered;
            });
        } else if (source === 'ordered') {
            setOrderedFragments(prev => {
                const filtered = prev.filter(f => f.id !== fragmentObj.id);
                const newOrdered = [...filtered];
                newOrdered.splice(index, 0, fragmentObj);
                return newOrdered;
            });
        }

        setDraggedItem(null);
    };

    const handleDropToAvailable = (e) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { fragmentObj, source } = draggedItem;

        if (source === 'ordered') {
            setOrderedFragments(prev => prev.filter(f => f.id !== fragmentObj.id));
            setAvailableFragments(prev => [...prev, fragmentObj]);
        }

        setDraggedItem(null);
    };

    const handleSubmitOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const query = orderedFragments.map(f => f.text).join('\n');

        try {
            // Add minimum delay to ensure PROCESSING state is visible
            await Promise.all([
                onSubmit(query),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setAvailableFragments(prepareFragments(fragments));
        setOrderedFragments([]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Available Fragments Pool */}
            <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    AVAILABLE FRAGMENTS (Drag to reorder below)
                </h4>
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropToAvailable}
                    style={{
                        minHeight: '80px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '2px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                >
                    {availableFragments.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                            All fragments used
                        </div>
                    ) : (
                        availableFragments.map((fragmentObj) => (
                            <div
                                key={fragmentObj.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, fragmentObj, 'available')}
                                onClick={() => handleItemClick(fragmentObj, 'available')}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    padding: '0.75rem',
                                    borderLeft: '3px solid var(--accent-secondary)',
                                    fontFamily: 'var(--font-code)',
                                    cursor: 'grab',
                                    transition: 'all 0.2s',
                                    opacity: draggedItem?.fragmentObj?.id === fragmentObj.id ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = 'var(--accent-secondary)'}
                            >
                                {fragmentObj.text}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Ordered Query Area */}
            <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    YOUR QUERY (Drop fragments in correct order)
                </h4>
                <div
                    style={{
                        minHeight: '150px',
                        background: 'rgba(0, 255, 65, 0.05)',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                >
                    {orderedFragments.length === 0 ? (
                        <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropToOrdered(e, 0)}
                            style={{
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                padding: '2rem',
                                border: '2px dashed var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)'
                            }}
                        >
                            Drop fragments here to build your query
                        </div>
                    ) : (
                        <>
                            {orderedFragments.map((fragmentObj, idx) => (
                                <React.Fragment key={fragmentObj.id}>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropToOrdered(e, idx)}
                                        style={{ height: '4px', background: 'transparent' }}
                                    />
                                    <div
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, fragmentObj, 'ordered')}
                                        onClick={() => handleItemClick(fragmentObj, 'ordered')}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            padding: '0.75rem',
                                            borderLeft: '3px solid var(--accent-primary)',
                                            fontFamily: 'var(--font-code)',
                                            cursor: 'grab',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            opacity: draggedItem?.fragmentObj?.id === fragmentObj.id ? 0.5 : 1
                                        }}
                                    >
                                        <span style={{ color: 'var(--accent-warning)', fontWeight: 'bold', minWidth: '20px' }}>
                                            {idx + 1}.
                                        </span>
                                        <span>{fragmentObj.text}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropToOrdered(e, orderedFragments.length)}
                                style={{ height: '20px', background: 'transparent' }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleReset}
                    className="btn btn-outline"
                    type="button"
                    disabled={isSubmitting}
                >
                    RESET
                </button>
                <button
                    onClick={handleSubmitOrder}
                    className="btn btn-primary"
                    type="button"
                    disabled={orderedFragments.length === 0 || isSubmitting}
                    style={{
                        opacity: isSubmitting ? 0.8 : 1,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        background: isSubmitting ? 'var(--accent-warning)' : 'var(--accent-primary)',
                        transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        minWidth: '150px'
                    }}
                >
                    {isSubmitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                border: '2px solid #000',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite'
                            }}></span>
                            PROCESSING...
                        </span>
                    ) : (
                        'SUBMIT QUERY'
                    )}
                </button>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DragDropSQL;
