# @ 通配符配置说明

## 概述

本项目已配置 `@` 通配符，可以将 `@` 作为 `src` 目录的别名使用，简化导入路径。

## 配置详情

### TypeScript 配置 (tsconfig.app.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Vite 配置 (vite.config.ts)
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

## 使用方法

### 之前的导入方式
```typescript
import BufferGeometry from "./pages/BufferGeometry";
import CameraHelper from "./pages/CameraHelper";
import GuiControl from "./pages/GuiControl";
```

### 使用 @ 通配符后
```typescript
import BufferGeometry from "@/pages/BufferGeometry";
import CameraHelper from "@/pages/CameraHelper";
import GuiControl from "@/pages/GuiControl";
```

## 更多示例

```typescript
// 导入组件
import MonacoEditor from "@/components/monacoEditor";

// 导入页面
import SphereGeometry from "@/pages/SphereGeometry";

// 导入工具函数
import { testConfig } from "@/utils/test";

// 导入样式
import "@/index.css";

// 导入资源
import earthImage from "@/assets/earth_technology.jpg";
```

## 优势

1. **路径更清晰**：不需要计算相对路径层级
2. **重构友好**：移动文件时不需要修改导入路径
3. **代码更简洁**：减少 `../../../` 这样的路径
4. **IDE 支持**：更好的自动补全和跳转功能

## 注意事项

- 确保在 `src` 目录下的文件才能使用 `@` 通配符
- 重启开发服务器以确保配置生效
- 如果使用 VS Code，可能需要重启 TypeScript 服务 