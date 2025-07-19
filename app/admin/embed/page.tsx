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
import { Settings, CheckCircle, ExternalLink } from "lucide-react"

const DOMAIN = "https://thisistalksel.vercel.app"

export default function EmbedPage() {
  const [chatbotId, setChatbotId] = useState("1")
  const [domain, setDomain] = useState("example.com")
  const [position, setPosition] = useState("bottom-right")
  const [primaryColor, setPrimaryColor] = useState("#0D9488")
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
    if (document.getElementById('talksell-widget-script')) return;

    const script = document.createElement('script');
    script.id = 'talksell-widget-script';
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

    return () => {
      const existingScript = document.getElementById('talksell-widget-script');
      if (existingScript) {
        existingScript.remove();
      }
      const widgetContainer = document.getElementById('talksell-widget-container');
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, [chatbotId, position, primaryColor, marginX, marginY, autoOpen, welcomeDelay]);

  return null;
};

export default TalkSellChatbot;`
  }

  const generateNextJSCode = () => {
    return `'use client'

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
      id="talksell-widget-script"
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
}`
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
                  placeholder="1"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="margin_x">فاصله افقی (px)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="margin_x"
                      min={0}
                      max={200}
                      step={1}
                      value={[marginX]}
                      onValueChange={(value) => setMarginX(value[0])}
                    />
                    <span className="font-bold w-12 text-center">{marginX}px</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="margin_y">فاصله عمودی (px)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="margin_y"
                      min={0}
                      max={200}
                      step={1}
                      value={[marginY]}
                      onValueChange={(value) => setMarginY(value[0])}
                    />
                    <span className="font-bold w-12 text-center">{marginY}px</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="primary-color">رنگ اصلی</Label>
                <div className="flex gap-2">
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
                    placeholder="#0D9488"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mobile">نمایش در موبایل</Label>
                <Switch id="mobile" checked={showOnMobile} onCheckedChange={setShowOnMobile} />
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
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              <Card>
                <CardHeader>
                  <CardTitle>کد HTML</CardTitle>
                  <CardDescription>این کد را قبل از تگ {"</body>"} در صفحات وب‌سایت خود قرار دهید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateEmbedCode()} readOnly className="font-mono text-sm min-h-[300px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateEmbedCode())}>
                        {copied ? "کپی شد!" : "کپی"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Other Tabs Content */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
