import '../utils/dayjs'

import { defineBoot } from '@quasar/app-vite/wrappers'
import { useDialog } from 'src/components/dialog'
import { initAutoUpdate } from 'src/utils/autoUpdate'
import { autoInitVConsole } from 'src/utils/vconsole'

const dialogApp = useDialog().app

export default defineBoot(({ app, router }) => {
  const appList = [app, dialogApp]

  appList.forEach((app) => {
    app.use(router)
  })

  autoInitVConsole()
  // 初始化自动更新
  initAutoUpdate()
})
