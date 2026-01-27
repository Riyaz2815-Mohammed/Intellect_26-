import React, { useState } from 'react';

const DragDropSQL = ({ fragments, onSubmit }) => {
    const [availableFragments, setAvailableFragments] = useState([...fragments]);
    const [orderedFragments, setOrderedFragments] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);

    const handleDragStart = (e, fragment, source) => {
        setDraggedItem({ fragment, source });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropToOrdered = (e, index) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { fragment, source } = draggedItem;

        if (source === 'available') {
            // Remove from available
            setAvailableFragments(prev => prev.filter(f => f !== fragment));
            // Add to ordered at specific position
            setOrderedFragments(prev => {
                const newOrdered = [...prev];
                newOrdered.splice(index, 0, fragment);
                return newOrdered;
            });
        } else if (source === 'ordered') {
            // Reorder within ordered
            setOrderedFragments(prev => {
                const newOrdered = prev.filter(f => f !== fragment);
                newOrdered.splice(index, 0, fragment);
                return newOrdered;
            });
        }

        setDraggedItem(null);
    };

    const handleDropToAvailable = (e) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { fragment, source } = draggedItem;

        if (source === 'ordered') {
            // Remove from ordered
            setOrderedFragments(prev => prev.filter(f => f !== fragment));
            // Add back to available
            setAvailableFragments(prev => [...prev, fragment]);
        }

        setDraggedItem(null);
    };

    const handleSubmitOrder = () => {
        const query = orderedFragments.join('\n');
        onSubmit(query);
    };

    const handleReset = () => {
        setAvailableFragments([...fragments]);
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
                        availableFragments.map((fragment, idx) => (
                            <div
                                key={`avail-${idx}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, fragment, 'available')}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    padding: '0.75rem',
                                    borderLeft: '3px solid var(--accent-secondary)',
                                    fontFamily: 'var(--font-code)',
                                    cursor: 'grab',
                                    transition: 'all 0.2s',
                                    opacity: draggedItem?.fragment === fragment ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = 'var(--accent-secondary)'}
                            >
                                {fragment}
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
                            {orderedFragments.map((fragment, idx) => (
                                <React.Fragment key={`ordered-${idx}`}>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropToOrdered(e, idx)}
                                        style={{ height: '4px', background: 'transparent' }}
                                    />
                                    <div
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, fragment, 'ordered')}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            padding: '0.75rem',
                                            borderLeft: '3px solid var(--accent-primary)',
                                            fontFamily: 'var(--font-code)',
                                            cursor: 'grab',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            opacity: draggedItem?.fragment === fragment ? 0.5 : 1
                                        }}
                                    >
                                        <span style={{ color: 'var(--accent-warning)', fontWeight: 'bold', minWidth: '20px' }}>
                                            {idx + 1}.
                                        </span>
                                        <span>{fragment}</span>
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
                >
                    RESET
                </button>
                <button
                    onClick={handleSubmitOrder}
                    className="btn btn-primary"
                    type="button"
                    disabled={orderedFragments.length === 0}
                >
                    SUBMIT QUERY
                </button>
            </div>
        </div>
    );
};

export default DragDropSQL;
