import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteExternalsPlugin } from 'vite-plugin-externals' // 用来手动指定全局变量,来处理cdn引入Marzipano后没有被挂载到全局中的问题

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 单独加入下方内容
    viteExternalsPlugin({
      marzipano: 'Marzipano'
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  }
})
