import Vue from 'vue'
import Consts from '@/utils/consts'
export const MASK_LIFE_TYPE_OPTIONS = [
  {
    label: '跳转到视频列表页',
    value: 'video'
  },
  {
    label: '拉起到作者主页',
    value: 'authorMain'
  },
  {
    label: '拉起到作者分类页',
    value: 'authorCategory'
  },
  {
    label: '正常启动',
    value: 'launch'
  }
]
export const MASK_LIFE_TYPES = {
  video: 'video',
  authorMain: 'authorMain',
  authorCategory: 'authorCategory',
  launch: 'launch'
}
export const MASK_LIFE_RECOMMEND_TYPE_OPTIONS = [
  {
    label: '随心看视频流',
    value: 'recommend'
  },
  {
    label: '知识视频流',
    value: 'category'
  },
  {
    label: '作者视频流',
    value: 'author'
  }
]

export const MASK_LIFE_RECOMMEND_TYPES = {
  recommend: 'recommend',
  category: 'category',
  author: 'author'
}

export const GD_LIVE_CLICK_TYPE_OPTIONS = [
  {
    label: '启动到频道',
    value: 'channel'
  },
  {
    label: '正常启动',
    value: 'normal'
  },
  {
    label: '启动到节目',
    value: 'telecast'
  },
  // {
  //   label: '启动到回看(自动时间)',
  //   value: 'autoCast'
  // },
  {
    label: '跳转节目单版面',
    value: 'teleTab'
  },
  {
    label: '节目规则启动',
    value: 'rule'
  }
]

export const GD_LIVE_CLICK_TYPES = {
  channel: 'channel',
  normal: 'normal',
  telecast: 'telecast',
  // autoCast: 'autoCast',
  teleTab: 'teleTab',
  rule: 'rule'
}

export const WEEK_OPTIONS = [
  {
    label: '星期一',
    value: 1
  },
  {
    label: '星期二',
    value: 2
  },
  {
    label: '星期三',
    value: 3
  },
  {
    label: '星期四',
    value: 4
  },
  {
    label: '星期五',
    value: 5
  },
  {
    label: '星期六',
    value: 6
  },
  {
    label: '星期七',
    value: 7
  }
]

export const prefixMap = {
  tencent: '_otx_',
  yinhe: '_oqy_',
  youku: '_oyk_'
}

export function getVideoInfo (video) {
  let { category = '', categoryName = '', filterValue = '' } = video
  category = category.split(',')
  categoryName = categoryName.split(',')
  filterValue = filterValue.split(',')
  const categoryOptions = category.map((value, index) => {
    return {
      label: categoryName[index],
      filterValue: filterValue[index],
      value
    }
  })
  return {
    categoryOptions,
    authorId: video.userId,
    authorName: video.userName
  }
}

export function getMatchedPictureUrlByRotation (blockSize, imgList) {
  imgList = imgList || []
  let targetImg = imgList[0] || {}
  if (imgList.length > 1) {
    const [w, h] = blockSize
    const rotation = w > h ? 'h' : 'v'
    targetImg = imgList.find(item => item.style === rotation) || targetImg
  }
  return targetImg.url
}

export function getMatchedPictureUrl (blockSize, imgList) {
  let maxMatchingValue = -99999
  let url
  if (blockSize && imgList) {
    imgList.forEach(item => {
      const matchingValue = getMatchingValue(blockSize, item.size.split(/[*|x]/))
      if (matchingValue > maxMatchingValue) {
        maxMatchingValue = matchingValue
        url = item.url
      }
    })
  }
  return url
}

function getMatchingValue (blockSize, imgSize) {
  const [w, h] = blockSize
  const [imgW, imgH] = imgSize

  const ratio = w / h
  const imgRatio = imgW / imgH
  const isSameOrient = (w >= h && imgW >= imgH) || (w <= h && imgW <= imgH)
  const baseMatchingValue = isSameOrient ? 100 : 0
  const ratioMatchingValue = 70 - 45 * Math.abs(ratio - imgRatio)

  let scale
  if (ratio > imgRatio) {
    scale = w > imgW ? w / imgW : imgW / w
  } else {
    scale = h > imgH ? h / imgH : imgH / h
  }
  const sizeMatchingValue = Math.max(38 - 8 * scale, 0)
  return baseMatchingValue + ratioMatchingValue + sizeMatchingValue
}

export function setMediaContent (contentForm, options) {
  const {
    selectedType,
    selected,
    selectedEpisode,
    blockSize
  } = options
  const partner = selected._partner

  const getPictureUrl = function () {
    return getMatchedPictureUrl.apply(null, arguments)
  }

  // 清空由app可能引起的遗留数据
  Object.assign(contentForm, {
    coverType: 'media',
    vContentId: '',
    blockResourceType: '',
    platformId: '',
    versionCode: '',
    extraValue1: '',
    extraValue4: '',
    extraValue5: '',
    clickSign: 0,
    onclick: ''
  })
  if (selectedType === 'video') {
    // 影视中心
    if (selectedEpisode) {
      const fieldMap = {
        0: 'extraValue5',
        1: 'extraValue5',
        6: 'extraValue4'
      }
      const extraIdField =
        fieldMap[selectedEpisode.urlIsTrailer] || 'extraValue5'
      const prefix = prefixMap[partner]
      contentForm.contentType = 0
      contentForm.videoContentType = 'movie'
      if (selectedEpisode.urlIsTrailer === 6 && selectedEpisode.thirdVId) {
        // 如果是短视频, 并且 thirdVId 存在
        contentForm.extraValue1 = prefix + selectedEpisode.thirdVId
      } else {
        contentForm.extraValue1 = prefix + selected.coocaaVId
      }
      const { thirdVuId = '', onclick } = selectedEpisode
      const isBilibili = thirdVuId.indexOf('bili') === 0
      if (isBilibili) {
        contentForm[extraIdField] = thirdVuId
        contentForm.clickSign = onclick ? 1 : 0
        contentForm.onclick = onclick
      } else {
        contentForm[extraIdField] = selectedEpisode.coocaaMId
      }
      contentForm.singleId = selectedEpisode.coocaaMId
      contentForm.pictureUrl = selectedEpisode.thumb
      contentForm.title = selectedEpisode.urlTitle
      contentForm.subTitle = chopSubTitle(selectedEpisode.urlSubTitle)
      contentForm.singleSubTitle = ''
      contentForm.blockResourceType = 1
    } else {
      if (partner === 'tencent') {
        contentForm.extraValue1 = '_otx_' + selected.coocaaVId
      } else if (partner === 'yinhe') {
        contentForm.extraValue1 = '_oqy_' + selected.coocaaVId
      } else if (partner === 'youku') {
        contentForm.extraValue1 = '_oyk_' + selected.coocaaVId
      }
      contentForm.singleId = ''
      contentForm.contentType = 0
      contentForm.videoContentType = 'movie'
      contentForm.extraValue5 = undefined
      contentForm.platformId = selected.source
      contentForm.pictureUrl = getPictureUrl(blockSize, selected.imageInfoList) || selected.thumb
      contentForm.picturePreset = selected.imageInfoList
      contentForm.title = selected.title
      contentForm.subTitle = chopSubTitle(selected.subTitle)
      contentForm.singleSubTitle = ''
      contentForm.blockResourceType = 1
      const ccVideoSourceEntity = (selected.ccVideoSourceEntities || [])[0]
      contentForm.clickSign = ccVideoSourceEntity.clickSign || 0
      contentForm.onclick = contentForm.clickSign ? ccVideoSourceEntity.onclick : ''
    }

    const entity = selected.ccVideoSourceEntities[0]
    const score = entity.score
    const updatedSegment = entity.updatedSegment
    const publishSegment = entity.publishSegment
    // eslint-disable-next-line
    const isUnknown = publishSegment == 0
    const publishStatus = isUnknown
      ? 'unknown'
      : updatedSegment === publishSegment
        ? 'ended'
        : 'updating'
    contentForm.publishStatus = publishStatus
    contentForm.score = score
    contentForm.series = isUnknown ? null : updatedSegment
    contentForm.variety = entity.lastCollection
  } else if (selectedType === 'edu') {
    // 教育中心
    contentForm.contentType = 3
    const videoContentTypeMap = {
      // 绘本
      2: 'eduPicBook',
      // 故事
      3: 'eduListenStory'
    }
    if (selectedEpisode) {
      const fieldMap = {
        0: 'extraValue5',
        1: 'extraValue5',
        6: 'extraValue4'
      }
      const extraIdField =
        fieldMap[selectedEpisode.urlIsTrailer] || 'extraValue5'
      contentForm[extraIdField] = selectedEpisode.coocaaMId
      contentForm.title = selectedEpisode.urlTitle
      contentForm.singleId = selectedEpisode.coocaaMId
    } else {
      contentForm.title = selected.title
      contentForm.singleId = ''
      contentForm.extraValue5 = undefined
    }
    contentForm.videoContentType = videoContentTypeMap[selected.contentForm] || 'edu'
    contentForm.extraValue1 = '_otx_' + selected.coocaaVId
    contentForm.platformId = selected.source
    contentForm.pictureUrl = getPictureUrl(blockSize, selected.imageInfoList) || selected.thumb
    contentForm.picturePreset = selected.imageInfoList
    contentForm.subTitle = chopSubTitle(selected.subTitle)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 1
    const ccVideoSourceEntities = selected.ccVideoSourceEntities
    contentForm.sourceSign = selected.sourceSign // 选择教育时新增一个权益字段，供大屏端使用
    if (
      ccVideoSourceEntities &&
      ccVideoSourceEntities[0] &&
      ccVideoSourceEntities[0].isTvod === 1
    ) {
      // Sprint2.2 教育中心单点付费预置版本号
      contentForm.versionCode = 3420000
    }
  } else if (selectedType === 'pptv') {
    // pptv
    contentForm.contentType = 4
    contentForm.videoContentType = 'pptv'
    contentForm.extraValue1 =
      'pptv_tvsports://tvsports_detail?section_id=' +
      selected.pid +
      '&from_internal=1'
    contentForm.title = selected.pTitle
    contentForm.subTitle = chopSubTitle(selected.pTitle)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 1
  } else if (selectedType === 'live') {
    // 直播资源
    contentForm.contentType = 6
    contentForm.videoContentType = 'txLive'
    contentForm.extraValue1 = selected.vId + ''
    contentForm.platformId = selected.source
    contentForm.pictureUrl = selected.thumb
    contentForm.title = selected.title
    contentForm.subTitle = chopSubTitle(selected.subTitle)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 1
    contentForm.clickSign = selected.clickSign || 0
    contentForm.onclick = contentForm.clickSign ? selected.onclick : ''
  } else if (selectedType === 'topic') {
    // 专题资源
    selected.dataSign === 'parentTopic'
      ? (contentForm.contentType = 8)
      : (contentForm.contentType = 7)
    selected.dataSign === 'parentTopic'
      ? (contentForm.videoContentType = 'bigTopic')
      : (contentForm.videoContentType = 'topic')
    contentForm.extraValue1 = selected.code + ''
    contentForm.pictureUrl = getPictureUrl(blockSize, selected.imageInfoList) || selected.picture
    contentForm.title = selected.title
    contentForm.subTitle = chopSubTitle(selected.subTitle)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 1
  } else if (selectedType === 'rotate') {
    // 轮播资源
    contentForm.extraValue1 = selected.id + ''
    contentForm.pictureUrl = selected.picture
    contentForm.title = selected.title
    contentForm.subTitle = chopSubTitle(selected.subTitle)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 1
    contentForm.videoContentType = 'rotate'
  }
  contentForm.categoryId = selected.categoryId
}

function musicResFormat (type, res) {
  return {
    music: {
      resourceId: res.musicId,
      resourceName: res.title,
      resourceImgUrl: res.cover
    },
    singer: {
      resourceId: res.singerId,
      resourceName: res.singerName,
      resourceImgUrl: res.cover
    }
  }[type] || { resourceName: '', resourceImgUrl: '' }
}

export function setMusicContent (contentForm, selected, videoContentType = 'music') {
  console.log(contentForm, selected, videoContentType)
  if (selected) {
    let res = musicResFormat(videoContentType, selected)

    contentForm.coverType = 'music'
    // contentForm.contentType = 2 // 历史遗留问题，没什么用处的字段，非必填
    contentForm.videoContentType = videoContentType // 'singer' || 'music'
    contentForm.extraValue1 = res.resourceId // >>>>
    contentForm.pictureUrl = res.resourceImgUrl // >>>>
    contentForm.title = res.resourceName // >>>>
    contentForm.subTitle = chopSubTitle(res.resourceName) // >>>>
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = -1 // 历史遗留问题，没什么用处的字段，但是必填
  }
}

export function setAppContent (contentForm, selected) {
  if (selected) {
    contentForm.coverType = 'app'
    contentForm.contentType = 2
    contentForm.videoContentType = 'app'
    contentForm.extraValue1 = selected.appPackageName
    contentForm.pictureUrl = selected.appImageUrl
    contentForm.title = selected.appName
    contentForm.subTitle = chopSubTitle(selected.appName)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = 3
  }
}

export function setGoodContent (contentForm, selected) {
  if (selected) {
    contentForm.coverType = 'mall'
    contentForm.contentType = 13
    contentForm.videoContentType = 'mall'
    contentForm.extraValue1 = selected.resourceId
    contentForm.pictureUrl = selected.resourceImgUrl
    contentForm.title = selected.resourceName
    contentForm.subTitle = chopSubTitle(selected.resourceName)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = -1
  }
}

export function setRankingContent (contentForm, selected) {
  if (selected) {
    contentForm.coverType = 'media'
    contentForm.contentType = 0
    contentForm.videoContentType = 'movie'
    contentForm.extraValue1 = selected.id
    contentForm.pictureUrl = selected.images
    contentForm.title = selected.title
    contentForm.subTitle = chopSubTitle(selected.title)
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = -1
  }
}

export function setSubscribeContent (contentForm, options) {
  const {
    selected
  } = options
  const partner = selected._partner
  if (selected) {
    contentForm.coverType = 'media'
    contentForm.contentType = 0
    contentForm.videoContentType = 'movie'
    contentForm.extraValue1 = prefixMap[partner] + selected.trailerId
    contentForm.pictureUrl = selected.picture
    contentForm.title = selected.trailerTitle
    contentForm.thirdSource = selected.thirdSource
    contentForm.subTitle = selected.positiveTitle
    contentForm.singleSubTitle = ''
    contentForm.blockResourceType = -1
    contentForm.subscribeOnlineTime = selected.onlineTime || ''
  }
}

export function setEduCoursePoolContent (contentForm, selected) {
  console.log(contentForm, selected, "===课程选择")
  if (selected) {
    contentForm.coverType = 'eduCoursePool'
    contentForm.pictureUrl = selected.pictureUrl
    contentForm.title = selected.title
    contentForm.contentType = 'eduCoursePool'
    contentForm.extraValue1 = selected.courseId
    contentForm.subTitle = selected.subTitle
    contentForm.clickSign = 0
    contentForm.onclick = selected.onClick
    contentForm.videoContentType = 'eduCoursePool' // 防止会显后台接口没有返回该🈯值。
  }
}

export function getSelectedResource (resources, selectedType) {
  const selectType = Object.keys(resources).find(
    key => resources[key].length > 0
  )
  return getSelectedResourceByType(resources, selectType)
}
export function getSelectedResourceByType (resources, selectedType) {
  const selected = resources[selectedType]
  const selectedEpisode = resources[`${selectedType}Episode`] || {}
  return { selectedType, selected, selectedEpisode }
}

export function chopSubTitle (title) {
  return (title || '').slice(0, 45)
}

export function getIdByCoverType (coverType, content) {
  switch (coverType) {
    case 'media':
      return content.extraValue1
    case 'block':
      return content.vContentId
    case 'mall':
      return content.extraValue1
  }
}
export function genDefaultDmpRecSourceForm () {
  return {
    id: '',
    dmpRegistryInfo: {},
    imgConfig: {
      poster: {
        pictureUrl: ''
      },
      cornerIconList: [{}, {}, {}, {}]
    },
    labelInfo: [],
    coverType: 'media',
    videoContentType: '',
    title: '',
    subTitle: '',
    versionCode: '',
    params: '',
    videoIdOrPackageName: '',
    singleVideoId: '',
    shortVideoId: '',
    maskLifeInfo: {
      lifeType: MASK_LIFE_TYPES.launch,
      videoId: '',
      authorId: '',
      authorName: '',
      categoryId: '',
      categoryName: '',
      recommendType: '',
      filterValue: ''
    },
    onclick: '',
    clickSign: 0,
    redundantParams: getDefaultParams(),
    appParams: []
  }
}

export function genPicInfo () {
  return {
    poster: {
      pictureId: '',
      pictureStatus: '',
      pictureUrl: ''
    },
    cornerIconList: [{}, {}, {}, {}]
  }
}
export function parseDmpFormData (sourceForm) {
  const videoIdOrPackageName = sourceForm.extraValue1
  const singleVideoId = sourceForm.singleId // || sourceForm.singleVideoId
  const shortVideoId = sourceForm.extraValue4 || sourceForm.shortVideoId
  const pictureUrl = sourceForm.pictureUrl || sourceForm.imgConfig.poster.pictureUrl
  delete sourceForm.blockResourceType
  delete sourceForm.categoryId
  delete sourceForm.contentType
  delete sourceForm.extraValue1
  delete sourceForm.extraValue4
  delete sourceForm.extraValue5
  delete sourceForm.picturePreset
  delete sourceForm.platformId
  delete sourceForm.publishStatus
  delete sourceForm.score
  delete sourceForm.series
  delete sourceForm.singleId
  delete sourceForm.singleSubTitle
  delete sourceForm.singleVideoId
  delete sourceForm.vContentId
  delete sourceForm.variety
  // delete sourceForm.pictureUrl
  sourceForm.videoIdOrPackageName = videoIdOrPackageName
  sourceForm.singleVideoId = singleVideoId
  sourceForm.shortVideoId = shortVideoId
  sourceForm.imgConfig.poster.pictureUrl = pictureUrl
}
export function genDefaultContentForm (preset) {
  preset = preset || {}
  const initMaskLifeInfo = preset.maskLifeInfo
  delete preset.maskLifeInfo
  return {
    coverType: 'media',
    title: '',
    showTitle: 0,
    subTitle: '',
    showSubTitle: 0,
    singleSubTitle: '',
    pictureUrl: '',
    backgroundPosterUrl: '',
    frontPosterUrl: '',
    videoContentPosterInfo: { dynamicPosterSwitch: 0, dynamicPosterAlign: 0 },
    specialPosterFlag: 0,
    flagSetFocusPictureUrl: false,
    focusPictureUrl: '',
    showSeries: 1,
    showScore: 1,
    alternativePictureUrl: '',
    extraValue1: '',
    extraValue5: '',
    singleId: '',
    vContentId: '',
    resourceType: 0,
    cornerList: [{}, {}, {}, {}],
    iconTextPositionsJsonStr: [{ position: 'left_top' },
      { position: 'right_top' },
      { position: 'right_bottom' },
      { position: 'left_bottom' }],
    blockResourceType: -1,
    moviePercent: 100,
    // 推荐位点击跳转
    jumpType: 'detail',
    versionCode: '',
    price: '',
    secKillPrice: '',
    flagIsSetad: 0,
    redundantParams: getDefaultParams(),
    // Sprint2.8.2 背景图片和视频
    bgImgUrl: '',
    flagSetRec: 0,
    flagTagVector: 0, // 标签引导
    mediaAutomationBlockRls: {
      refreshCal: 1,
      mediaAutomationId: '',
      blockType: 'normal'
    },
    bgParams: {
      id: ''
    },
    bgType: '',
    // 应用参数
    appParams: [],
    // 生活方式
    maskLifeInfo: genDefaultMaskLifeInfo(initMaskLifeInfo),
    // 广电APK
    tvLiveInfo: undefined,
    mediaTreeResource: undefined, // 媒资列表
    ...preset
  }
}

export function genDefaultTvLiveInfo (preset) {
  return {
    clickType: GD_LIVE_CLICK_TYPES.channel,
    categoryId: undefined,
    channelId: undefined,
    startTime: undefined,
    provinceId: undefined,
    regularHour: undefined,
    weekInfo: [],
    firstPlayDate: undefined,
    aheadSeries: undefined,
    ruleId: undefined,
    ...preset
  }
}

export function genDefaultMaskLifeInfo (preset) {
  return {
    /**
    video-跳转视频列表页
    authorMain-跳转作者主页
    authorCategory-作者分类
    launch-正常启动
    */
    lifeType: 'launch',
    videoId: '', // 视频资源id
    authorId: '', // 作者id
    authorName: '', // 作者名称，用于前端显示
    categoryId: '', // 知识id
    categoryName: '', // 知识名称，用于前端显示
    recommendType: 'recommend', // category, author
    filterValue: '',
    videoInfo: null,
    needBackHome: '1', // 是否返回主页, 1 返回芝士app主页，0返回系统主页
    ...preset
  }
}
export function getDefaultParams () {
  return {
    openMode: 'app',
    webpageUrl: '',
    webpageType: '2',
    videoName: '',
    videoUrl: '',
    pictureUrl: '',
    tabId: '',
    tabName: '',
    packagename: '',
    versioncode: '-1',
    dowhat: 'startActivity',
    bywhat: 'action',
    byvalue: '',
    data: undefined,
    params: [{ key: '', value: '' }]
  }
}

export function genResourceContentList (resources, contentPreset) {
  const contentList = [].concat(
    genMediaContentList(resources, contentPreset, 'video'),
    genAppContentList(resources, contentPreset),
    genMediaContentList(resources, contentPreset, 'edu'),
    genMediaContentList(resources, contentPreset, 'pptv'),
    genMediaContentList(resources, contentPreset, 'live'),
    genMediaContentList(resources, contentPreset, 'topic'),
    genMediaContentList(resources, contentPreset, 'rotate'),
    genGoodContentList(resources, contentPreset),
    genMusicContentList(resources, contentPreset, 'music'),
    genMusicContentList(resources, contentPreset, 'singer'),
    genEduCoursePoolList(resources, contentPreset, 'eduCoursePool')
  )
  return contentList
}

export function genMediaContentList (resources, contentPreset, selectType) {
  const selectedResult = getSelectedResourceByType(resources, selectType)
  const selectedType = selectedResult.selectedType
  const selected = selectedResult.selected || []
  const selectedEpisode = selectedResult.selectedEpisode
  const getContent = (item, ep) => {
    const content = genDefaultContentForm(contentPreset)
    setMediaContent(content, {
      selectedType,
      selected: item,
      selectedEpisode: ep
    })
    return content
  }
  // 判断单选还是多选
  const contentList = selected.reduce((result, item) => {
    const itemEpisodes = selectedEpisode[item.coocaaVId]
    if (itemEpisodes && itemEpisodes.length > 0) {
      return result.concat(itemEpisodes.map(ep => {
        return getContent(item, ep)
      }))
    } else {
      return result.concat(getContent(item))
    }
  }, [])
  return contentList
}
export function genMediaRuleContentList (resourcesList, contentPreset) {
  const contentList = resourcesList.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setMediaContent(content, {
      selectedType: item.businessType === 0 ? 'video' : 'edu',
      selected: item
    })
    return content
  })
  return contentList
}
export function genAppContentList (resources, contentPreset) {
  const selected = resources.app || []
  const contentList = selected.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setAppContent(content, item)
    return content
  })
  return contentList
}

export function genGoodContentList (resources, contentPreset) {
  const selected = resources.good || []
  const contentList = selected.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setGoodContent(content, item)
    return content
  })
  return contentList
}
/**
 * @param { 'music'| 'singer' } selectType 音乐内容类型
 * @description http://wiki.skyoss.com/pages/viewpage.action?pageId=27085193
 */
export function genMusicContentList (resources, contentPreset, selectType) {
  const selected = resources[selectType] || []
  const contentList = selected.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setMusicContent(content, item, selectType)
    return content
  })
  return contentList
}

const rankingCorners = [
  {
    cornerIconId: 10334,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110042310136_46*50.png'
  },
  {
    cornerIconId: 10335,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110130504587_46*50.png'
  },
  {
    cornerIconId: 10336,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110130914436_46*50.png'
  },
  {
    cornerIconId: 10337,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110130735921_46*50.png'
  },
  {
    cornerIconId: 10338,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110130455987_46*50.png'
  },
  {
    cornerIconId: 10339,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110131328570_46*50.png'
  },
  {
    cornerIconId: 10340,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110131373933_46*50.png'
  },
  {
    cornerIconId: 10341,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110131101494_46*50.png'
  },
  {
    cornerIconId: 10342,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110131545215_46*50.png'
  },
  {
    cornerIconId: 10343,
    position: 0,
    imgUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110131525588_46*50.png'
  }
]
export function genRankingContentList (resources, contentPreset) {
  const rankingCode = resources.rankingCode
  const selected = resources.ranking || []
  const contentList = selected.map((item, index) => {
    const content = genDefaultContentForm()
    const rankingCorner = rankingCorners[index]
    content.cornerList = [
      {
        ...rankingCorner
      },
      {}
    ]
    setRankingContent(content, item)
    return content
  })
  // 最后一个为查看更多
  const readMore = genDefaultContentForm({
    title: '查看更多',
    coverType: 'custom',
    pictureUrl:
      'http://img.sky.fs.skysrt.com/tvos6_imgs_master/20191029/20191029110257831374_260*364.jpg',
    onclick: JSON.stringify({
      packagename: 'com.tianci.movieplatform',
      versioncode: 7100001,
      dowhat: 'startActivity',
      bywhat: 'action',
      byvalue: 'coocaa.intent.movie.ranking',
      params: {
        rankingCode: rankingCode
      },
      exception: {}
    })
  })
  return contentList.concat(readMore)
}

export function genSpotContentList (resources, contentPreset) {
  return resources.map((selected, index) => {
    const { title, picture, coocaaVId, selectedEpisodes, onclick, source: partner } = selected
    let extraValue5 = ''
    let onclickStr = ''
    let clickSign = 0
    let singleSubTitle = ''
    if (selectedEpisodes && selectedEpisodes.length) {
      const { coocaaMId, urlSubTitle } = selectedEpisodes[0]
      extraValue5 = coocaaMId // 单集ID
      singleSubTitle = urlSubTitle
    }
    if (onclick) {
      const onclickJson = JSON.parse(onclick)
      onclickJson.params.vid = extraValue5
      onclickStr = JSON.stringify(onclickJson)
      clickSign = 1
    }
    const source = Consts.partnerToSource[partner]
    const prefix = Consts.sourcePrefix[source]

    const contentForm = genDefaultContentForm()
    contentForm.coverType = 'media'
    contentForm.contentType = 0
    contentForm.videoContentType = 'movie'
    contentForm.extraValue1 = `${prefix}${coocaaVId}`
    contentForm.extraValue5 = extraValue5
    contentForm.pictureUrl = picture
    contentForm.title = title
    contentForm.subTitle = chopSubTitle(title)
    contentForm.singleSubTitle = singleSubTitle
    contentForm.blockResourceType = -1
    contentForm.onclick = onclickStr
    contentForm.clickSign = clickSign
    return contentForm
  })
}

export function genSubscribeContentList (resources, contentPreset) {
  const selected = resources.subscribe || []
  const contentList = selected.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setSubscribeContent(content, { selected: item })
    return content
  })
  return contentList
}

export function isValidLayoutForRanking (contentList = []) {
  // 检查布局
  // 采用排行榜，布局必须满足：标题布局、只有一行、每个推荐位都是247*346、推荐位数量6~11个
  const blockCount = contentList.length
  const hasTitleAndOnlyOneRowAndMatchSize = contentList.every(item => {
    // eslint-disable-next-line
    const { width, height, y, title_info, mall_resize } = item.contentPosition
    // eslint-disable-next-line
    return y === 0 && width === 260 && height === 364 && title_info && !mall_resize
  })
  const hasSuitableBlocks = blockCount >= 6 && blockCount <= 11

  return hasTitleAndOnlyOneRowAndMatchSize && hasSuitableBlocks
}

export const thirdSourcePrefixMap = {
  cibn: 'cibn',
  movie1905: 'movie1905',
  sohu: 'sohu',
  mgtv: 'mgtv',
  gdn: '4KGarden',
  wasu: 'wasu',
  tvb: 'tvb',
  bili: 'bili',
  df: 'dfdjy'
}

export function parseContent (content) {
  const coverType = content.coverType
  let onclick = ''
  let params = ''
  if (coverType === 'custom') {
    content.contentType = 0
  }
  if (coverType === 'block') {
    content.contentType = 1
  }
  if (coverType === 'custom') {
    const currentOnclick = content.redundantParams
    const openMode = currentOnclick.openMode
    params = 'openMode==' + openMode
    const webpageType = currentOnclick.webpageType
    switch (openMode) {
      case 'webpage': {
        if (webpageType === '1') {
          // 浮窗网页
          onclick = JSON.stringify({
            packagename: 'com.coocaa.app_browser',
            versioncode: currentOnclick.versioncode,
            dowhat: 'startActivity',
            bywhat: 'action',
            byvalue: 'coocaa.intent.action.browser',
            params: {
              url: currentOnclick.webpageUrl
            },
            exception: {}
          })
        } else if (webpageType === '2') {
          // 全屏网页
          onclick = JSON.stringify({
            packagename: 'com.coocaa.app_browser',
            versioncode: currentOnclick.versioncode,
            dowhat: 'startActivity',
            bywhat: 'action',
            byvalue: 'coocaa.intent.action.browser.no_trans',
            params: {
              url: currentOnclick.webpageUrl
            },
            exception: {}
          })
        }
        break
      }
      case 'video': {
        onclick = JSON.stringify({
          packagename: 'com.tianci.movieplatform',
          versioncode: '-1',
          dowhat: 'startService',
          bywhat: 'action',
          byvalue: 'coocaa.intent.player.video',
          params: {
            name: currentOnclick.videoName,
            url: currentOnclick.videoUrl,
            needParse: 'false',
            url_type: 'web'
          },
          exception: {}
        })
        break
      }
      case 'picture': {
        onclick = JSON.stringify({
          packagename: 'com.tianci.movieplatform',
          versioncode: '',
          dowhat: 'startService',
          bywhat: 'action',
          byvalue: 'coocaa.intent.player.image',
          params: {
            name: '',
            url: currentOnclick.pictureUrl
          },
          exception: {}
        })
        break
      }
      case 'tab': {
        var tabType = currentOnclick.tabType
        params += ',tabType==' + tabType
        var isValueType = ''
        if (tabType === '1') {
          isValueType = 'coocaa.intent.action.HOME_COMMON_LIST'
        } else if (tabType === '14') {
          isValueType = 'coocaa.intent.action.HOME_TAB_THEME_EDU'
        } else if (tabType === '13') {
          isValueType = 'coocaa.intent.action.HOME_SPECIAL_TOPIC_PAGE_EDU'
        } else {
          isValueType = 'coocaa.intent.action.HOME_SPECIAL_TOPIC'
        }
        onclick = JSON.stringify({
          packagename: (tabType === '14' || tabType === '13') ? 'com.coocaa.educate' : 'com.tianci.movieplatform',
          versioncode: '',
          dowhat: 'startActivity',
          bywhat: 'action',
          // eslint-disable-next-line
          byvalue: isValueType,
          params: {
            id: currentOnclick.tabId
          },
          exception: tabType === '13' ? {
            'name': 'onclick_exception',
            'value': {
              'packagename': 'com.tianci.appstore',
              'dowhat': 'startActivity',
              'versioncode': '-1',
              'params': {
                'id': 'com.coocaa.educate'
              },
              'byvalue': 'coocaa.intent.action.APP_STORE_DETAIL',
              'bywhat': 'action'
            }
          } : {}
        })
        break
      }
      case 'app': {
        let convertedParams = {}
        let params = currentOnclick.params
        for (var i = 0; i < params.length; i++) {
          var p = params[i]
          if (p.key !== '' && p.value !== '') {
            convertedParams[p.key] = p.value
          }
        }
        onclick = JSON.stringify({
          byvalue: currentOnclick.byvalue,
          packagename: currentOnclick.packagename,
          dowhat: currentOnclick.dowhat,
          versioncode: currentOnclick.versioncode,
          params: convertedParams,
          bywhat: currentOnclick.bywhat,
          data: currentOnclick.data,
          exception: {
            name: 'onclick_exception',
            value: {
              packagename: 'com.tianci.appstore',
              dowhat: 'startActivity',
              versioncode: '-1',
              params: {
                id: currentOnclick.packagename
              },
              byvalue: 'coocaa.intent.action.APP_STORE_DETAIL',
              bywhat: 'action'
            }
          }
        })
        break
      }
      default:
        break
    }
  }
  if (content.coverType === 'mediaCategoryTree') {
    const { length, last = length - 1 } = content.extraValue1
    const lastMediaTreeId = content.extraValue1[last]
    content.coverType = 'mediaCategoryTree'
    content.videoContentType = 'mediaCategoryTree'
    content.extraValue1 = JSON.stringify(content.extraValue1)
    console.log(content.extraValue1, '--extraValue1')
    onclick = JSON.stringify({
      packagename: 'com.coocaa.educate',
      versioncode: 10100003,
      dowhat: 'startActivity',
      bywhat: 'action',
      byvalue: 'coocaa.intent.movie.newlist_EDU',
      params: {
        id: '_ct_' + lastMediaTreeId,
        toLeft: content.extraValue1.length > 1 ? '1' : '0'
      },
      exception: {}
    })
  }
  if (coverType === 'eduCoursePool') {
    // eslint-disable-next-line
    content.onclick = content.onclick // 媒资课程自带点击参数
  } else {
    content.onclick = (coverType === 'media' && content.clickSign) ? content.onclick : onclick
  }
  content.params = params
  if (content.bgParams) {
    content.bgParams = JSON.stringify(content.bgParams)
  }
  // 应用参数
  const appParamsList = content.appParams
  if (appParamsList instanceof Array && appParamsList.length !== 0) {
    const appParamsObj = appParamsList.reduce((result, item) => {
      result[item.key] = item.value
      return result
    }, {})
    content.appParams = JSON.stringify(appParamsObj)
  } else {
    content.appParams = ''
  }
  return content
}

export function setContent (data) {
  console.log('1-1-1-1--->', data)
  let redundantParams
  const defaultContentForm = genDefaultContentForm()
  data.cornerList = (data.cornerList || []).reduce((result, item) => {
    result[item.position] = item
    return result
  }, defaultContentForm.cornerList)
  data.iconTextPositionsJsonStr = data.iconTextPositionsJsonStr || []
  if (typeof data.iconTextPositionsJsonStr === 'string') {
    data.iconTextPositionsJsonStr = JSON.parse(data.iconTextPositionsJsonStr)
  }
  const iconTextPositionsJsonStr = [
    { position: 'left_top' },
    { position: 'right_top' },
    { position: 'right_bottom' },
    { position: 'left_bottom' }
  ]
  iconTextPositionsJsonStr.forEach(item => {
    const match = data.iconTextPositionsJsonStr.find(icon => icon.position === item.position) || {}
    item.iconText = match.iconText
  })
  data.iconTextPositionsJsonStr = iconTextPositionsJsonStr
  if (data.coverType === 'custom') {
    const onclick = JSON.parse(data.onclick)
    // 处理格式奇怪的params属性
    const params = data.params.split(',').reduce((result, item) => {
      const [key, val] = item.split('==')
      result[key] = val
      return result
    }, {})
    const openMode = params.openMode || 'app' // 为兼容业务专辑中没有openMode的params参数 采用app作为默认值
    switch (openMode) {
      case 'webpage': {
        onclick.webpageUrl = onclick.params.url
        if (onclick.byvalue === 'coocaa.intent.action.browser') {
          onclick.webpageType = '1'
        }
        if (onclick.byvalue === 'coocaa.intent.action.browser.no_trans') {
          onclick.webpageType = '2'
        }
        break
      }
      case 'video': {
        onclick.videoName = onclick.params.name
        onclick.videoUrl = onclick.params.url
        break
      }
      case 'picture': {
        onclick.pictureUrl = onclick.params.url
        break
      }
      case 'tab': {
        onclick.tabId = onclick.params.id
        onclick.tabType = params.tabType
        break
      }
      case 'app': {
        const onclickParams = onclick.params
        onclick.params = Object.keys(onclick.params).map(key => {
          return {
            key,
            value: onclickParams[key]
          }
        })
        break
      }
      default:
        break
    }

    redundantParams = onclick
    redundantParams.openMode = openMode
    delete data.onclick
  }

  if (redundantParams) {
    data.redundantParams = redundantParams
  }
  // 应用参数
  const appParamsStr = data.appParams
  if (appParamsStr && typeof appParamsStr === 'string') {
    const appParamsObj = JSON.parse(appParamsStr)
    data.appParams = Object.keys(appParamsObj).map(key => {
      return { key, value: appParamsObj[key] }
    })
  } else {
    data.appParams = []
  }

  data.bgParams = data.bgParams ? JSON.parse(data.bgParams) : { id: undefined }
  data.maskLifeInfo = genDefaultMaskLifeInfo(data.maskLifeInfo)
  data.tvLiveInfo = genDefaultTvLiveInfo(data.tvLiveInfo)
  return Object.assign({}, defaultContentForm, data)
}
/**
 * @param { 'edu'} 课程资源类型
 * @description 课程资源
 */
export function genEduCoursePoolList (resources, contentPreset) {
  const selected = resources.course || []
  const contentList = selected.map(item => {
    const content = genDefaultContentForm(contentPreset)
    setEduCoursePoolContent(content, item)
    return content
  })
  return contentList
}
// 清除所有的遴选任务（在复制和创建副本时）
export function delAllExperiment (activePannel) {
  (activePannel.contentList || []).forEach(({ specificContentList = [], videoContentList = [] }, index) => {
    specificContentList.concat(videoContentList).forEach(ele => {
      ele.experimentInfo = undefined
    })
  })
}
export async function getAllRunExperiment (activePannel, panelGroup) {
  let experimentIndexList = [];
  (activePannel.contentList || []).forEach(({ specificContentList = [], videoContentList = [] }, index) => {
    let experimentList = specificContentList.concat(videoContentList).filter(ele => ele.experimentInfo).map(ele => ele.experimentInfo)
    if (experimentList.length) {
      experimentIndexList.push({ data: experimentList, index: index + 1 })
    }
  })

  let allId = []
  experimentIndexList.forEach(({ data, index }) => {
    allId.push(...data.map(ele => ele.experimentId))
    // allIndex.push(index)
  })
  if (allId.length) {
    let allExperimentState = await Vue.prototype.$service.getExperimentList({ id: String(allId) })
    let allIndex = []
    allId = []
    allExperimentState.forEach(({ state, blockIndex, id, panelVersion }) => {
      let currentVersion = panelGroup ? panelGroup.currentVersion : panelVersion
      if (state === 3 && panelVersion === currentVersion) { // state 执行状态,0-失败,3-进行中,4-完成
        allIndex.push(blockIndex)
        allId.push(id)
      }
    })
    return { allId, allIndex: Array.from(new Set(allIndex)) }
  } else {
    return { allId: [], allIndex: [] }
  }
}
