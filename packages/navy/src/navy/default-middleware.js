import developMiddleware from '../middleware/develop'
import tagOverrideMiddleware from '../middleware/tag-override'
import portOverrideMiddleware from '../middleware/port-override'
import addVirtualHostsMiddleware from '../middleware/add-virtual-hosts'

import type {Navy} from './'

export default (navy: Navy) => ([
  developMiddleware,
  tagOverrideMiddleware,
  portOverrideMiddleware,
  addVirtualHostsMiddleware(navy),
])
