import { beforeEach, expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'
import { INSPECTOR_ID } from './constants'
import {
  handleEditInspectorState,
  handleGetInspectorState,
  handleGetInspectorTree,
  handleInspectComponent,
} from './devtools'
import { byGroupId, byUid, upsert } from './registry'
import {
  DevtoolsApi,
  DevtoolsApiHandlerPayload,
} from './types'

beforeEach(() => {
  vi.clearAllMocks()
  byUid.clear()
  byGroupId.clear()
})

test('getInspectorTree filters by groupId', () => {
  upsert({
    uid: 'Component1-state1',
    groupId: 'Component1',
    componentName: 'Component1',
    componentInstance: null,
    debugState: {},
  })
  upsert({
    uid: 'Component1-state2',
    groupId: 'Component1',
    componentName: 'Component1',
    componentInstance: null,
    debugState: {},
  })
  upsert({
    uid: 'Component2-state1',
    groupId: 'Component2',
    componentName: 'Component2',
    componentInstance: null,
    debugState: {},
  })

  const payload: DevtoolsApiHandlerPayload<'getInspectorTree'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      filter: 'Component1',
      rootNodes: [],
    }
  handleGetInspectorTree(payload)

  expect(payload.rootNodes).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "id": "Component1-state1",
            "label": "Component1-state1",
          },
          {
            "id": "Component1-state2",
            "label": "Component1-state2",
          },
        ],
        "id": "Component1",
        "label": "Component1",
      },
    ]
  `)
})

test('getInspectorTree filters by uid', () => {
  upsert({
    uid: 'comp1-state1',
    groupId: 'Component1',
    componentName: 'Component1',
    componentInstance: null,
    debugState: {},
  })
  upsert({
    uid: 'comp1-state2',
    groupId: 'Component1',
    componentName: 'Component1',
    componentInstance: null,
    debugState: {},
  })
  upsert({
    uid: 'comp2-state1',
    groupId: 'Component2',
    componentName: 'Component2',
    componentInstance: null,
    debugState: {},
  })

  const payload: DevtoolsApiHandlerPayload<'getInspectorTree'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      filter: 'state1',
      rootNodes: [],
    }
  handleGetInspectorTree(payload)

  expect(payload.rootNodes).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "id": "comp1-state1",
            "label": "comp1-state1",
          },
        ],
        "id": "Component1",
        "label": "Component1",
      },
      {
        "children": [
          {
            "id": "comp2-state1",
            "label": "comp2-state1",
          },
        ],
        "id": "Component2",
        "label": "Component2",
      },
    ]
  `)
})

test('getInspectorState for individual entry', () => {
  const mockApi = {
    highlightElement: vi.fn(),
    unhighlightElement: vi.fn(),
  } as unknown as DevtoolsApi

  const mockEntry = {
    uid: 'test-uid',
    groupId: 'TestGroup',
    componentName: 'TestComponent',
    componentInstance: null,
    debugState: { count: 1, name: 'test', foo: ref('bar') },
  }

  upsert(mockEntry)

  const payload: DevtoolsApiHandlerPayload<'getInspectorState'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      nodeId: 'test-uid',
      state: {},
    }
  handleGetInspectorState(mockApi)(payload)

  expect(payload.state).toMatchInlineSnapshot(`
    {
      "test-uid": [
        {
          "editable": true,
          "key": "count",
          "value": 1,
        },
        {
          "editable": true,
          "key": "name",
          "value": "test",
        },
        {
          "editable": true,
          "key": "foo",
          "value": RefImpl {
            "__v_isRef": true,
            "__v_isShallow": false,
            "_rawValue": "bar",
            "_value": "bar",
            "dep": Dep {
              "__v_skip": true,
              "activeLink": undefined,
              "computed": undefined,
              "key": undefined,
              "map": undefined,
              "sc": 0,
              "subs": undefined,
              "subsHead": undefined,
              "version": 0,
            },
          },
        },
      ],
    }
  `)
})

test('getInspectorState for group entry', () => {
  const mockApi = {
    highlightElement: vi.fn(),
    unhighlightElement: vi.fn(),
  } as unknown as DevtoolsApi

  const mockEntry1 = {
    uid: 'uid1',
    groupId: 'TestGroup',
    componentName: 'TestComponent',
    componentInstance: null,
    debugState: { state1: 'value1' },
  }
  const mockEntry2 = {
    uid: 'uid2',
    groupId: 'TestGroup',
    componentName: 'TestComponent',
    componentInstance: null,
    debugState: { state2: 'value2' },
  }

  upsert(mockEntry1)
  upsert(mockEntry2)

  const payload: DevtoolsApiHandlerPayload<'getInspectorState'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      nodeId: 'TestGroup',
      state: {},
    }
  handleGetInspectorState(mockApi)(payload)

  expect(payload.state).toMatchInlineSnapshot(`
    {
      "uid1": [
        {
          "key": "state1",
          "value": "value1",
        },
      ],
      "uid2": [
        {
          "key": "state2",
          "value": "value2",
        },
      ],
    }
  `)
  expect(mockApi.unhighlightElement).toHaveBeenCalled()
})

test('inspectComponent adds state to payload', () => {
  const componentInstance = null
  const mockEntry = {
    uid: 'test-uid',
    groupId: 'TestGroup',
    componentName: 'TestComponent',
    componentInstance,
    debugState: { value: 42 },
  }

  upsert(mockEntry)

  const payload: DevtoolsApiHandlerPayload<'inspectComponent'> =
    {
      app: {},
      componentInstance,
      instanceData: {
        id: '',
        name: '',
        file: '',
        state: [],
      },
    }
  handleInspectComponent(payload)

  expect(payload.instanceData.state).toMatchInlineSnapshot(`
    [
      {
        "editable": false,
        "key": "value",
        "type": "test-uid",
        "value": 42,
      },
    ]
  `)
})

test('editInspectorState for existent entry', () => {
  const debugState = { value: computed(() => 23) }
  upsert({
    groupId: 'groupid',
    uid: 'uid',
    componentName: 'Foo',
    componentInstance: null,
    debugState,
  })

  const setMock = vi.fn()

  const payload: DevtoolsApiHandlerPayload<'editInspectorState'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      nodeId: 'uid',
      path: [],
      type: '',
      state: {
        value: 'yess',
        newKey: undefined,
        remove: undefined,
      },
      set: setMock,
    }

  handleEditInspectorState(payload)

  expect(setMock).toHaveBeenCalledExactlyOnceWith(
    debugState,
  )
})

test('editInspectorState for non-existent entry', () => {
  upsert({
    groupId: 'groupid',
    uid: 'uid',
    componentName: 'Foo',
    componentInstance: null,
    debugState: { value: computed(() => 23) },
  })

  const setMock = vi.fn()

  const payload: DevtoolsApiHandlerPayload<'editInspectorState'> =
    {
      app: {},
      inspectorId: INSPECTOR_ID,
      nodeId: 'rando',
      path: [],
      type: '',
      state: {
        value: 'yess',
        newKey: undefined,
        remove: undefined,
      },
      set: setMock,
    }

  handleEditInspectorState(payload)

  expect(setMock).not.toHaveBeenCalled()
})
