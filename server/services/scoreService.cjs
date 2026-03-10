/**
 * Mock Credit Scoring Service for M&T Growth Gateway
 */
const calculateClientScore = async (clientId) => {
    // In a real app, this would query historical data, external CRB, etc.
    // For now, return a random but consistent score between 300 and 850
    const seed = clientId.split('-')[0];
    const hash = parseInt(seed, 16) || 500;
    const score = 300 + (hash % 550);

    return {
        clientId,
        score,
        rating: score > 700 ? 'Excellent' : score > 600 ? 'Good' : score > 500 ? 'Fair' : 'Poor',
        updatedAt: new Date()
    };
};

module.exports = {
    calculateClientScore
};
