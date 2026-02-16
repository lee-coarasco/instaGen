# Gemini API Models - Quick Reference

## ✅ Available Models (v1beta API)

### **Gemini 1.5 Flash** (Currently Used)
- **Model ID**: `gemini-1.5-flash`
- **Status**: ✅ Stable, Production-ready
- **Best for**: Fast responses, cost-effective
- **Features**:
  - Text generation
  - JSON mode
  - Vision capabilities
  - Long context (1M tokens)
- **Rate Limits**: 15 RPM (free tier)

### **Gemini 1.5 Pro**
- **Model ID**: `gemini-1.5-pro`
- **Status**: ✅ Stable, Production-ready
- **Best for**: Complex reasoning, higher quality
- **Features**:
  - Advanced reasoning
  - Better accuracy
  - Vision capabilities
  - Long context (2M tokens)
- **Rate Limits**: 2 RPM (free tier)

### **Gemini 1.0 Pro**
- **Model ID**: `gemini-pro`
- **Status**: ✅ Stable (Legacy)
- **Best for**: Basic text generation
- **Features**:
  - Text generation only
  - Standard context
- **Rate Limits**: 60 RPM (free tier)

---

## ❌ NOT Available in v1beta

### **Gemini 2.0 Flash Exp**
- **Model ID**: `gemini-2.0-flash-exp`
- **Status**: ❌ Not available in v1beta API
- **Error**: `404 - models/gemini-2.0-flash-exp is not found for API version v1beta`

---

## 🔧 Current Configuration

InstaGen uses **`gemini-1.5-flash`** for:
- ✅ Fast responses
- ✅ Cost-effective
- ✅ Good quality for our use case
- ✅ Vision capabilities (for future features)

### File: `src/services/ai/geminiClient.js`
```javascript
this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
```

---

## 🚀 Upgrading to Gemini 1.5 Pro (Optional)

If you need better quality responses, change to:

```javascript
this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
```

**Trade-offs:**
- ✅ Better quality and reasoning
- ✅ More accurate JSON responses
- ❌ Slower responses
- ❌ Lower rate limits (2 RPM vs 15 RPM)
- ❌ Higher cost (if using paid tier)

---

## 📊 Model Comparison

| Feature | Flash | Pro |
|---------|-------|-----|
| **Speed** | ⚡ Fast | 🐢 Slower |
| **Quality** | ✅ Good | ⭐ Excellent |
| **Rate Limit (Free)** | 15 RPM | 2 RPM |
| **Context Length** | 1M tokens | 2M tokens |
| **Best For** | Production apps | Complex tasks |

---

## 🔍 How to Check Available Models

### Using API:
```bash
curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY
```

### Using SDK:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(API_KEY)
const models = await genAI.listModels()
console.log(models)
```

---

## 💡 Recommendations

### **For InstaGen:**
- ✅ **Use `gemini-1.5-flash`** for development and production
- ✅ Fast enough for real-time user experience
- ✅ Good quality for intent analysis and content structuring
- ✅ Cost-effective

### **When to use Pro:**
- Complex visual planning that needs better reasoning
- Higher quality prompt engineering
- Production apps with budget for better quality

---

## 🐛 Common Errors

### **404 Model Not Found**
```
models/gemini-2.0-flash-exp is not found for API version v1beta
```
**Solution**: Use `gemini-1.5-flash` or `gemini-1.5-pro`

### **429 Rate Limit**
```
Resource has been exhausted (e.g. check quota)
```
**Solution**: 
- Wait and retry
- Upgrade to paid tier
- Use Flash instead of Pro (higher limits)

### **400 Invalid Model**
```
Invalid model name
```
**Solution**: Check model ID spelling and API version

---

## 📚 Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Model List**: https://ai.google.dev/models/gemini
- **Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/docs/rate_limits

---

*Last Updated: 2026-02-14*
*Current Model: gemini-1.5-flash*
