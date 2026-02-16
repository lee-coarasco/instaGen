# Gemini API Troubleshooting Guide 🔧

## ✅ **FIXED: Model Error**

### **Issue:**
```
models/gemini-1.5-flash is not found for API version v1beta
```

### **Solution:**
Updated to use **`gemini-pro`** which is the correct model for the v1beta API.

**File Updated:** `src/services/ai/geminiClient.js`
```javascript
// Now using:
model: 'gemini-pro'           // For text generation
model: 'gemini-pro-vision'    // For image analysis
```

---

## 🔑 **Step 1: Verify Your API Key**

### **Check if API Key is Set**

Open your `.env` file and verify:
```bash
VITE_GEMINI_API_KEY=AIzaSy...  # Should be a real key, not placeholder
```

### **Get Your API Key**
1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key
4. Paste into `.env` file

### **Restart Dev Server**
After adding/changing the API key:
```bash
# Press Ctrl+C in terminal, then:
npm run dev
```

---

## 🧪 **Step 2: Test Your API Key**

### **Automatic Verification**
The app now automatically verifies your API key on startup!

**Check the browser console (F12):**
- ✅ **Success**: `✅ Gemini API verified: API key is valid and working!`
- ❌ **Failure**: `❌ Gemini API verification failed: [error message]`

### **Manual Test**
Open browser console and run:
```javascript
// Test API directly
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY')
  .then(r => r.json())
  .then(d => console.log('Available models:', d.models))
```

---

## 🐛 **Common Errors & Solutions**

### **Error 1: API Key Not Found**
```
VITE_GEMINI_API_KEY is not defined in environment variables
```

**Solution:**
1. Create `.env` file in project root (if missing)
2. Add: `VITE_GEMINI_API_KEY=your_key_here`
3. Restart dev server

---

### **Error 2: 404 Model Not Found**
```
models/gemini-xxx is not found for API version v1beta
```

**Solution:**
Use only these models with v1beta API:
- ✅ `gemini-pro` (text generation)
- ✅ `gemini-pro-vision` (image analysis)

**NOT available in v1beta:**
- ❌ `gemini-1.5-flash`
- ❌ `gemini-1.5-pro`
- ❌ `gemini-2.0-flash-exp`

---

### **Error 3: 400 API Key Invalid**
```
API key not valid. Please pass a valid API key.
```

**Solution:**
1. Double-check your API key (no extra spaces)
2. Make sure it starts with `AIzaSy`
3. Regenerate key if needed: https://makersuite.google.com/app/apikey
4. Check API is enabled in Google Cloud Console

---

### **Error 4: 429 Rate Limit Exceeded**
```
Resource has been exhausted (e.g. check quota)
```

**Solution:**
- **Free Tier Limits:**
  - `gemini-pro`: 60 requests per minute
  - Wait 60 seconds and try again
  
- **Upgrade:**
  - Enable billing in Google Cloud Console
  - Get higher rate limits

---

### **Error 5: 403 Permission Denied**
```
The caller does not have permission
```

**Solution:**
1. Check API key has correct permissions
2. Enable "Generative Language API" in Google Cloud Console
3. Regenerate API key if needed

---

## 📋 **Checklist: Is Everything Set Up?**

- [ ] `.env` file exists in project root
- [ ] `VITE_GEMINI_API_KEY` is set in `.env`
- [ ] API key is NOT the placeholder `your_gemini_api_key_here`
- [ ] API key starts with `AIzaSy`
- [ ] Dev server was restarted after adding key
- [ ] Browser console shows ✅ API verified message
- [ ] No errors in browser console (F12)

---

## 🧪 **Testing the Complete Flow**

### **1. Open the App**
```
http://localhost:3000
```

### **2. Check Console**
Press **F12** → **Console** tab

Look for:
```
✅ Gemini API verified: API key is valid and working!
📝 Test response: Hello! I can hear you.
```

### **3. Test Intent Analysis**
1. Click **"Start Creating"**
2. Fill the form:
   - Post Type: Carousel
   - Niche: Technology
   - Idea: "Create a carousel about AI tools"
3. Click **"Continue"**
4. Click **"Analyze Intent"**

### **4. Expected Result**
- Loading animation appears
- After 3-5 seconds, intent results display
- No errors in console

---

## 🔍 **Debug Mode**

### **Enable Verbose Logging**

Add to `src/services/ai/geminiClient.js`:
```javascript
async generateJSON(prompt, options = {}) {
  console.log('🔍 Generating JSON with prompt:', prompt.substring(0, 200))
  try {
    // ... existing code
    console.log('✅ JSON generated successfully')
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('❌ JSON generation failed:', error)
    console.error('📝 Raw response:', text)
    throw error
  }
}
```

---

## 📊 **API Key Status Check**

### **Quick Test Script**
Create `test-api.html` in project root:
```html
<!DOCTYPE html>
<html>
<head><title>API Test</title></head>
<body>
  <h1>Gemini API Test</h1>
  <button onclick="testAPI()">Test API Key</button>
  <pre id="result"></pre>
  
  <script>
    async function testAPI() {
      const key = prompt('Enter your API key:')
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      
      try {
        const res = await fetch(url)
        const data = await res.json()
        document.getElementById('result').textContent = JSON.stringify(data, null, 2)
      } catch (err) {
        document.getElementById('result').textContent = 'Error: ' + err.message
      }
    }
  </script>
</body>
</html>
```

Open in browser and test your key.

---

## 🚀 **Still Having Issues?**

### **1. Check API Status**
Visit: https://status.cloud.google.com/

### **2. Verify SDK Version**
```bash
npm list @google/generative-ai
```
Should be: `^0.21.0` or higher

### **3. Clear Cache**
```bash
# Stop server
Ctrl+C

# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Restart
npm run dev
```

### **4. Check Network**
```bash
# Test connectivity
curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
```

---

## 📞 **Get Help**

### **Resources:**
- **Gemini API Docs**: https://ai.google.dev/docs
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Community Forum**: https://discuss.ai.google.dev/
- **Stack Overflow**: Tag `google-gemini-api`

### **Common Solutions:**
1. **99% of issues**: Wrong API key or not restarting server
2. **Rate limits**: Wait 60 seconds
3. **Model errors**: Use `gemini-pro` only

---

## ✅ **Success Indicators**

You'll know everything is working when:
1. ✅ Console shows: `✅ Gemini API verified`
2. ✅ No red errors in console
3. ✅ Intent analysis completes successfully
4. ✅ Results display in UI

---

## 🎯 **Current Configuration**

```javascript
// Model: gemini-pro (v1beta API)
// Rate Limit: 60 RPM (free tier)
// Context: 32k tokens
// Features: Text generation, JSON mode
```

**This is the correct, stable configuration for InstaGen!** ✅

---

*Last Updated: 2026-02-14 01:03 IST*
*Status: Model error FIXED, using gemini-pro*
