"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Copy, Download, Code, Globe, Settings, CheckCircle, ExternalLink, Eye } from "lucide-react"

const DOMAIN = "https://thisistalksel.vercel.app"

export default function EmbedPage() {
  const [chatbotId, setChatbotId] = useState("3")
  const [domain, setDomain] = useState("example.com")
  const [position, setPosition] = useState("bottom-right")
  const [primaryColor, setPrimaryColor] = useState("#88C945")
  const [marginX, setMarginX] = useState(20)
  const [marginY, setMarginY] = useState(20)
  const [showOnMobile, setShowOnMobile] = useState(true)
  const [autoOpen, setAutoOpen] = useState(false)
  const [welcomeDelay, setWelcomeDelay] = useState("3000")
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    return `<!-- کد امبد چت‌بات تاکسل -->
<script 
  src="${DOMAIN}/widget-loader.js" 
  data-chatbot-id="${chatbotId}"
  data-position="${position}"
  data-primary-color="${primaryColor}"
  data-margin-x="${marginX}"
  data-margin-y="${marginY}"
  data-auto-open="${autoOpen}"
  data-welcome-delay="${welcomeDelay}"
  async>
</script>
<noscript>
  <p>برای استفاده از چت‌بات تاکسل، لطفاً JavaScript را فعال کنید.</p>
</noscript>`
  }

  const generateWordPressCode = () => {
    return `<?php
/**
 * افزودن چت‌بات تاکسل به وردپرس
 * این کد را در فایل functions.php قالب خود اضافه کنید
 */
function add_talksell_chatbot() {
    ?>
    <script 
      src="${DOMAIN}/widget-loader.js" 
      data-chatbot-id="<?php echo esc_attr('${chatbotId}'); ?>"
      data-position="<?php echo esc_attr('${position}'); ?>"
      data-primary-color="<?php echo esc_attr('${primaryColor}'); ?>"
      data-margin-x="<?php echo esc_attr('${marginX}'); ?>"
      data-margin-y="<?php echo esc_attr('${marginY}'); ?>"
      data-auto-open="<?php echo esc_attr('${autoOpen}'); ?>"
      data-welcome-delay="<?php echo esc_attr('${welcomeDelay}'); ?>"
      async>
    </script>
    <?php
}

// اضافه کردن به فوتر سایت
add_action('wp_footer', 'add_talksell_chatbot');
?>`
  }

  const generateReactCode = () => {
    return `import { useEffect } from 'react';

/**
 * کامپوننت چت‌بات تاکسل برای React
 */
const TalkSellChatbot = ({
  chatbotId = "${chatbotId}",
  position = "${position}",
  primaryColor = "${primaryColor}",
  marginX = ${marginX},
  marginY = ${marginY},
  autoOpen = ${autoOpen},
  welcomeDelay = ${welcomeDelay}
}) => {
  useEffect(() => {
    // جلوگیری از بارگذاری مجدد
    if (window.TalkSellWidgetLoaded) {
      return;
    }

    const script = document.createElement('script');
    script.src = '${DOMAIN}/widget-loader.js';
    script.setAttribute('data-chatbot-id', chatbotId);
    script.setAttribute('data-position', position);
    script.setAttribute('data-primary-color', primaryColor);
    script.setAttribute('data-margin-x', marginX.toString());
    script.setAttribute('data-margin-y', marginY.toString());
    script.setAttribute('data-auto-open', autoOpen.toString());
    script.setAttribute('data-welcome-delay', welcomeDelay.toString());
    script.async = true;
    
    document.body.appendChild(script);

    // تمیز کردن هنگام unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // حذف ویجت از DOM
      const widget = document.querySelector('#talksell-widget-container');
      if (widget) {
        widget.remove();
      }
      window.TalkSellWidgetLoaded = false;
    };
  }, [chatbotId, position, primaryColor, marginX, marginY, autoOpen, welcomeDelay]);

  return null; // این کامپوننت UI ندارد
};

export default TalkSellChatbot;

// نحوه استفاده:
// <TalkSellChatbot chatbotId="${chatbotId}" position="${position}" primaryColor="${primaryColor}" marginX={${marginX}} marginY={${marginY}} />`
  }

  const generateNextJSCode = () => {
    return `'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * کامپوننت چت‌بات تاکسل برای Next.js
 */
export default function TalkSellChatbot({
  chatbotId = "${chatbotId}",
  position = "${position}",
  primaryColor = "${primaryColor}",
  marginX = ${marginX},
  marginY = ${marginY},
  autoOpen = ${autoOpen},
  welcomeDelay = ${welcomeDelay}
}) {
  return (
    <Script
      src="${DOMAIN}/widget-loader.js"
      strategy="afterInteractive"
      data-chatbot-id={chatbotId}
      data-position={position}
      data-primary-color={primaryColor}
      data-margin-x={marginX}
      data-margin-y={marginY}
      data-auto-open={autoOpen.toString()}
      data-welcome-delay={welcomeDelay.toString()}
    />
  );
}

// نحوه استفاده در layout.tsx یا page.tsx:
// import TalkSellChatbot from './components/TalkSellChatbot'
// 
// export default function Layout({ children }) {
//   return (
//     <html>
//       <body>
//         {children}
//         <TalkSellChatbot chatbotId="${chatbotId}" marginX={${marginX}} marginY={${marginY}} />
//       </body>
//     </html>
//   )
// }`
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const testWidget = () => {
    window.open(`${DOMAIN}/test-sample-widget`, "_blank")
  }

  const previewCode = () => {
    // ایجاد یک صفحه پیش‌نمایش موقت
    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>پیش‌نمایش ویجت تاکسل</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
            }
            .preview-info {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              max-width: 600px;
              margin: 20px auto;
            }
            .config-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            .config-item {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 8px;
              border-left: 4px solid ${primaryColor};
            }
            .config-label {
              font-weight: bold;
              color: #333;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .config-value {
              color: #666;
              font-size: 14px;
            }
            .position-demo {
              position: fixed;
              width: 20px;
              height: 20px;
              background: ${primaryColor};
              border-radius: 50%;
              opacity: 0.7;
              z-index: 999998;
            }
          </style>
        </head>
        <body>
          <div class="preview-info">
            <h2 style="color: ${primaryColor}; margin-bottom: 15px;">🎯 پیش‌نمایش ویجت تاکسل</h2>
            <p style="color: #666; margin-bottom: 20px;">این صفحه نمایش زنده‌ای از تنظیمات ویجت شماست</p>
            
            <div class="config-grid">
              <div class="config-item">
                <div class="config-label">شناسه چت‌بات</div>
                <div class="config-value">${chatbotId}</div>
              </div>
              <div class="config-item">
                <div class="config-label">موقعیت</div>
                <div class="config-value">${position}</div>
              </div>
              <div class="config-item">
                <div class="config-label">فاصله افقی</div>
                <div class="config-value">${marginX}px</div>
              </div>
              <div class="config-item">
                <div class="config-label">فاصله عمودی</div>
                <div class="config-value">${marginY}px</div>
              </div>
              <div class="config-item">
                <div class="config-label">رنگ اصلی</div>
                <div class="config-value" style="color: ${primaryColor};">${primaryColor}</div>
              </div>
              <div class="config-item">
                <div class="config-label">باز شدن خودکار</div>
                <div class="config-value">${autoOpen ? "فعال" : "غیرفعال"}</div>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
              <strong style="color: #1976d2;">💡 نکته:</strong>
              <span style="color: #424242;">ویجت در گوشه ${position === "bottom-right" ? "پایین راست" : position === "bottom-left" ? "پایین چپ" : position === "top-right" ? "بالا راست" : "بالا چپ"} با فاصله ${marginX}px از ${position.includes("right") ? "راست" : "چپ"} و ${marginY}px از ${position.includes("bottom") ? "پایین" : "بالا"} قرار می‌گیرد.</span>
            </div>
          </div>
          
          ${generateEmbedCode()}
          
          <script>
            // نمایش نقطه موقعیت
            const dot = document.createElement('div');
            dot.className = 'position-demo';
            ${position.includes("bottom") ? `dot.style.bottom = '${marginY}px';` : `dot.style.top = '${marginY}px';`}
            ${position.includes("right") ? `dot.style.right = '${marginX}px';` : `dot.style.left = '${marginX}px';`}
            document.body.appendChild(dot);
            
            // حذف نقطه بعد از 5 ثانیه
            setTimeout(() => {
              if (dot.parentNode) dot.parentNode.removeChild(dot);
            }, 5000);
          </script>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">کد امبد چت‌بات تاکسل</h1>
          <p className="text-gray-600 mt-2">چت‌بات خود را در وب‌سایت نصب کنید</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="ml-1 h-3 w-3" />
            آماده نصب
          </Badge>
          <Button onClick={previewCode} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            پیش‌نمایش زنده
          </Button>
          <Button onClick={testWidget} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ExternalLink className="h-4 w-4" />
            تست ویجت
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تنظیمات امبد
              </CardTitle>
              <CardDescription>تنظیمات نمایش چت‌بات را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chatbot-id">شناسه چت‌بات</Label>
                <Input
                  id="chatbot-id"
                  value={chatbotId}
                  onChange={(e) => setChatbotId(e.target.value)}
                  placeholder="3"
                />
              </div>

              <div>
                <Label htmlFor="position">موقعیت چت‌بات</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">پایین راست</SelectItem>
                    <SelectItem value="bottom-left">پایین چپ</SelectItem>
                    <SelectItem value="top-right">بالا راست</SelectItem>
                    <SelectItem value="top-left">بالا چپ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="margin_x" className="flex items-center justify-between">
                    <span>فاصله افقی</span>
                    <Badge variant="outline">{marginX}px</Badge>
                  </Label>
                  <Slider
                    id="margin_x"
                    min={0}
                    max={200}
                    step={5}
                    value={[marginX]}
                    onValueChange={(value) => setMarginX(value[0])}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="margin_y" className="flex items-center justify-between">
                    <span>فاصله عمودی</span>
                    <Badge variant="outline">{marginY}px</Badge>
                  </Label>
                  <Slider
                    id="margin_y"
                    min={0}
                    max={200}
                    step={5}
                    value={[marginY]}
                    onValueChange={(value) => setMarginY(value[0])}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="primary-color">رنگ اصلی</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#88C945"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-open">باز شدن خودکار</Label>
                <Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} />
              </div>

              <div>
                <Label htmlFor="welcome-delay">تاخیر نمایش پیام خوشامد (میلی‌ثانیه)</Label>
                <Select value={welcomeDelay} onValueChange={setWelcomeDelay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">بدون تاخیر</SelectItem>
                    <SelectItem value="1000">1 ثانیه</SelectItem>
                    <SelectItem value="3000">3 ثانیه</SelectItem>
                    <SelectItem value="5000">5 ثانیه</SelectItem>
                    <SelectItem value="10000">10 ثانیه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="html" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                WordPress
              </TabsTrigger>
              <TabsTrigger value="react" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                React
              </TabsTrigger>
              <TabsTrigger value="nextjs" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Next.js
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              <Card>
                <CardHeader>
                  <CardTitle>کد HTML</CardTitle>
                  <CardDescription>این کد را قبل از تگ {"</body>"} در صفحات وب‌سایت خود قرار دهید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateEmbedCode()} readOnly className="font-mono text-sm min-h-[200px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateEmbedCode())}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "کپی شد!" : "کپی"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateEmbedCode(), "talksell-embed.html")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wordpress">
              <Card>
                <CardHeader>
                  <CardTitle>کد WordPress</CardTitle>
                  <CardDescription>این کد را در فایل functions.php قالب وردپرس خود اضافه کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateWordPressCode()} readOnly className="font-mono text-sm min-h-[300px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateWordPressCode())}>
                        <Copy className="h-4 w-4" />
                        کپی
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateWordPressCode(), "talksell-wordpress.php")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="react">
              <Card>
                <CardHeader>
                  <CardTitle>کامپوننت React</CardTitle>
                  <CardDescription>این کامپوننت را در اپلیکیشن React خود import و استفاده کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateReactCode()} readOnly className="font-mono text-sm min-h-[300px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateReactCode())}>
                        <Copy className="h-4 w-4" />
                        کپی
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateReactCode(), "TalkSellChatbot.jsx")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nextjs">
              <Card>
                <CardHeader>
                  <CardTitle>کامپوننت Next.js</CardTitle>
                  <CardDescription>این کامپوننت را در اپلیکیشن Next.js خود استفاده کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateNextJSCode()} readOnly className="font-mono text-sm min-h-[300px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateNextJSCode())}>
                        <Copy className="h-4 w-4" />
                        کپی
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateNextJSCode(), "TalkSellChatbot.tsx")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>راهنمای نصب تاکسل</CardTitle>
          <CardDescription>مراحل نصب چت‌بات تاکسل در وب‌سایت خود را دنبال کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">تنظیمات را انجام دهید</h3>
              <p className="text-sm text-gray-600">
                موقعیت، فاصله‌ها، رنگ و سایر تنظیمات چت‌بات را مطابق نیاز خود تنظیم کنید
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">پیش‌نمایش کنید</h3>
              <p className="text-sm text-gray-600">با کلیک روی "پیش‌نمایش زنده" ویجت را قبل از نصب تست کنید</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">کد را کپی کنید</h3>
              <p className="text-sm text-gray-600">
                کد مربوط به پلتفرم خود (HTML، WordPress، React یا Next.js) را کپی کنید
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">در سایت قرار دهید</h3>
              <p className="text-sm text-gray-600">کد را در محل مناسب وب‌سایت خود قرار دهید</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
