import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Settings, Save, Sparkles, Image as ImageIcon, CircleDollarSign } from 'lucide-react';
import { geminiClient } from '@services/ai/geminiClient';
import './SettingsPage.css';

const TEXT_MODELS = [
    { id: 'models/gemini-2.5-flash', label: 'Gemini 2.5 Flash', cost: '$0.075 / 1M tokens' },
    { id: 'models/gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended)', cost: '$0.10 / 1M tokens' },
    { id: 'models/gemini-flash-latest', label: 'Gemini Flash Latest', cost: 'Variable cost' }
];

const IMAGE_MODELS = [
    { id: 'models/imagen-3.0-generate-001', label: 'Imagen 3.0 (Recommended)', cost: '$0.03 / image' },
    { id: 'models/gemini-2.0-flash-exp-image-generation', label: 'Gemini 2.0 Flash Image Exp', cost: 'Experimental (Free)' },
    { id: 'models/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', cost: 'Standard pricing' }
];

export default function SettingsPage() {
    const { user } = useAuth();
    const [textModel, setTextModel] = useState('models/gemini-2.5-flash');
    const [imageModel, setImageModel] = useState('models/imagen-3.0-generate-001');
    const [dynamicTextModels, setDynamicTextModels] = useState(TEXT_MODELS);
    const [dynamicImageModels, setDynamicImageModels] = useState(IMAGE_MODELS);
    const [currency, setCurrency] = useState('USD');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loadingModels, setLoadingModels] = useState(true);

    useEffect(() => {
        const savedText = localStorage.getItem('instaGen-textModel') || 'models/gemini-2.5-flash';
        const savedImage = localStorage.getItem('instaGen-imageModel') || 'models/imagen-3.0-generate-001';
        const savedCurrency = localStorage.getItem('instaGen-currency') || 'USD';

        setTextModel(savedText);
        setImageModel(savedImage);
        setCurrency(savedCurrency);

        // Fetch dynamically from Google
        const fetchModels = async () => {
            try {
                const apiModels = await geminiClient.getAvailableModels();
                if (apiModels && apiModels.length > 0) {
                    // Extract model IDs 
                    const allApiModels = apiModels.map(m => m.name);

                    // Create enriched arrays including api models
                    const enrichedText = [];
                    const enrichedImage = [];

                    allApiModels.forEach(modelId => {
                        // Check if it's an image model (rudimentary check based on known naming conventions)
                        const isImage = modelId.includes('image') || modelId.includes('imagen');

                        // Check if we have hardcoded pricing info for it
                        const knownText = TEXT_MODELS.find(m => m.id === modelId);
                        const knownImage = IMAGE_MODELS.find(m => m.id === modelId);

                        if (isImage) {
                            enrichedImage.push({
                                id: modelId,
                                label: knownImage ? knownImage.label : modelId.replace('models/', ''),
                                cost: knownImage ? knownImage.cost : 'Unknown Cost'
                            });
                        } else if (modelId.includes('gemini')) {
                            enrichedText.push({
                                id: modelId,
                                label: knownText ? knownText.label : modelId.replace('models/', ''),
                                cost: knownText ? knownText.cost : 'Unknown Cost'
                            });
                        }
                    });

                    // Merge any hardcoded models that might be missing from the API response just in case
                    TEXT_MODELS.forEach(tm => {
                        if (!enrichedText.find(m => m.id === tm.id)) enrichedText.unshift(tm);
                    });
                    IMAGE_MODELS.forEach(im => {
                        if (!enrichedImage.find(m => m.id === im.id)) enrichedImage.unshift(im);
                    });

                    setDynamicTextModels(enrichedText);
                    setDynamicImageModels(enrichedImage);
                }
            } catch (err) {
                console.error("Failed to load dynamic models", err);
            } finally {
                setLoadingModels(false);
            }
        };

        fetchModels();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            localStorage.setItem('instaGen-textModel', textModel);
            localStorage.setItem('instaGen-imageModel', imageModel);
            localStorage.setItem('instaGen-currency', currency);

            // Re-initialize geminiClient with new models
            await geminiClient.initializeModels(textModel);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Settings saved, but failed to initialize model. Please check the API key.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-page container">
            <div className="settings-header">
                <Settings size={32} className="header-icon" />
                <div>
                    <h1>App Settings</h1>
                    <p>Configure your AI models and generation preferences</p>
                </div>
            </div>

            <div className="settings-content glass">
                <div className="settings-section">
                    <div className="section-header">
                        <Sparkles size={20} />
                        <h3>Text & Strategy Generation</h3>
                    </div>
                    <p className="section-desc">Used for analyzing intent, writing copy, and planning storyboard structures.</p>

                    <div className="form-group">
                        <label>Primary Text Model</label>
                        <select
                            value={textModel}
                            onChange={(e) => setTextModel(e.target.value)}
                            className="settings-select"
                            disabled={loadingModels}
                        >
                            {dynamicTextModels.map(m => (
                                <option key={m.id} value={m.id}>{m.label} &mdash; {m.cost}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section">
                    <div className="section-header">
                        <ImageIcon size={20} />
                        <h3>Image Generation</h3>
                    </div>
                    <p className="section-desc">Used for creating final carousel slide graphics and storyboard overviews.</p>

                    <div className="form-group">
                        <label>Primary Image Model</label>
                        <select
                            value={imageModel}
                            onChange={(e) => setImageModel(e.target.value)}
                            className="settings-select"
                            disabled={loadingModels}
                        >
                            {dynamicImageModels.map(m => (
                                <option key={m.id} value={m.id}>{m.label} &mdash; {m.cost}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section">
                    <div className="section-header">
                        <CircleDollarSign size={20} />
                        <h3>Currency Preferences</h3>
                    </div>
                    <p className="section-desc">Select the currency for displaying estimated resource costs.</p>

                    <div className="form-group">
                        <label>Display Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="settings-select"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>

                <div className="settings-actions">
                    {success && <span className="success-msg">Settings saved successfully!</span>}
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>Saving...</>
                        ) : (
                            <><Save size={18} /> Save Settings</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
