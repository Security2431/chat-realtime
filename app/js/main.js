
(($, sr) => {

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  const debounce = (func, threshold, execAsap) => {
    let timeout

    return function debounced () {
      const obj =    this
      const args =   arguments
      function delayed () {
        if (!execAsap) {
          func.apply(obj, args)
        }

        timeout = null
      }

      if (timeout) {
        clearTimeout(timeout)
      } else if (execAsap) {
        func.apply(obj, args)
      }

      timeout = setTimeout(delayed, threshold || 100)
    }
  }
  // smartresize
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr) }

})(jQuery,'smartresize')

// ================================================================================== //

  // # Document on Ready
  // # Document on Resize
  // # Document on Scroll
  // # Document on Load

  // # Old browser notification
  // # Anchor scroll
  // # Phone masked input
  // # Ajax form send
  // # Basic Elements

// ================================================================================== //


const GRVE = GRVE || {};


(($ => {
  // # Document on Ready
  // ============================================================================= //
  GRVE.documentReady = {
    init() {
      GRVE.outlineJS.init()
      GRVE.pageSettings.init()
      GRVE.basicElements.init()
      GRVE.ajax.init()
    }
  }

  // # Document on Resize
  // ============================================================================= //
  GRVE.documentResize = {
    init() {

    }
  }

  // # Document on Scroll
  // ============================================================================= //
  GRVE.documentScroll = {
    init() {

    }
  }

  // # Document on Load
  // ============================================================================= //
  GRVE.documentLoad = {
    init() {

    }
  }

  // # Remove outline on focus
  // ============================================================================= //
  GRVE.outlineJS = {
    init() {
      const self =           this

      this.styleElement =    document.createElement('STYLE'),
      this.domEvents =       'addEventListener' in document

      document.getElementsByTagName('HEAD')[0].appendChild(this.styleElement)

      // Using mousedown instead of mouseover, so that previously focused elements don't lose focus ring on mouse move
      this.eventListner('mousedown', () => {
        self.setCss(':focus{outline:0 !important}')
      })

      this.eventListner('keydown', () => {
        self.setCss('')
      })
    },
    setCss(css_text) {
      // Handle setting of <style> element contents in IE8
      !!this.styleElement.styleSheet ? this.styleElement.styleSheet.cssText = css_text : this.styleElement.innerHTML = css_text
    },
    eventListner(type, callback) {
      // Basic cross-browser event handling
      if (this.domEvents) {
        document.addEventListener(type, callback)
      } else {
        document.attachEvent(`on${type}`, callback)
      }
    }
  }


  // # Check window size in range
  // ============================================================================= //
  GRVE.isWindowSize = {
    init(min = undefined, max = undefined) {
      let media

      if (min !== undefined && max !== undefined) {
        media = matchMedia(`only screen and (min-width: ${min}px) and (max-width: ${max}px)`)
      } else if (min !== undefined && max === undefined) {
        media = matchMedia(`only screen and (min-width: ${min}px)`)
      } else if (min === undefined && max !== undefined) {
        media = matchMedia(`only screen and (max-width: ${max}px)`)
      } else {
        return true
      }

      return media.matches

    }
  }

// # Ajax send Form
  // ============================================================================= //
  GRVE.ajax = {
    init() {
      const self = this
      const $form = $('#userform')

      if (!$form.length) return false
      $form.on('submit', function(e) {
        if (self.validate) {
          self.send( $(this) )
        }
        e.preventDefault()
      })

      this.updateMessages()
    },
    validate() {
      return true
    },
    send($form) {
      const data =        new FormData($form[0])
      const $editor =     $form.find(".note-editable")
      const $textarea =   $form.find("textarea.form-control")

      const message =     $textarea.val()
      data.append('message', message)

      $.ajax({
        url:              'post.php',
        type:             'post',
        data,
        dataType:         'json',
        processData:      false,
        contentType:      false,
        cache:            false,
        success(data) {
          if (!data.success) {
            console.log("Ошибка")
          } else if (data.success) {
            GRVE.pageSettings.updateMessages(data)
            $editor.empty()
            $form.trigger("reset")
          }
        },
        error(XMLHttpRequest, textStatus, errorThrown) {
          console.log(textStatus || errorThrown)
        }
      })
    },
    updateMessages() {
      const data =        new FormData()
      data.append('status', 'update')

      $.ajax({
        url:              'post.php',
        type:             'post',
        data,
        dataType:         'json',
        processData:      false,
        contentType:      false,
        cache:            false,
        success(data) {
          if (!data.success) {
            console.log("Ошибка")
          } else if (data.success) {
            GRVE.pageSettings.updateMessages(data)
          }
        },
        error(XMLHttpRequest, textStatus, errorThrown) {
          console.log(textStatus || errorThrown)
        }
      })
    }
  }

  // # Page Settings
  // ============================================================================= //
  GRVE.pageSettings = {
    init() {
      this.updateMessagesByTimer()
      this.galleryUploader()
      this.dragndrop()
    },
    updateMessages({content}) {
      const $chatBox = $(".chat-box")
      let chatContent = ''

      content.forEach((item, i, content) => {
        chatContent += this.generateChatTemplate(item)
      })

      $chatBox.find("[data-message-id]").remove()

      $chatBox.prepend(chatContent)

    },
    updateMessagesByTimer() {
      let timer = setInterval(() => {
        GRVE.ajax.updateMessages()
      }, 60 * 1000) // Every 60 seconds
    },
    generateChatTemplate(json) {
      const { messageId, profile, isOwner, heading, message, datetime, datetext, image } = json

      const arrowBox = isOwner ? 'arrow-box-right' : 'arrow-box-left'

      let template = `<li id="message-${messageId}" data-message-id="${messageId}" data-profile-id="${profile.id}" class="${arrowBox}">
        <div class="avatar"><a href="${profile.link}">
            <div style="background-image: url(${profile.logo});" class="img-rounded avatar-container-25">
              <div data-presence-for-profile-id="${profile.id}" title="Был на сервисе 5 часов 55 минут назад" class="profile-status offline with-tooltip"></div>
            </div></a></div>
        <div class="info"><a href="${profile.link}" title="Профиль фрилансера forzz">${profile.name}</a>
          <div class="pull-right smallest">
            <time datetime="${datetime}" class="timeago">${datetext}</time><a href="#message-${messageId}"><i class="fa fa-anchor"></i></a><a href="mailbox/read/thread/2617283" title="Цитировать" class="reply-form-with-quote-trigger"><i class="fa fa-quote-left"></i></a>
          </div>
        </div>`

        if (heading) {
          template += `<h4 style="color: inherit">${heading}</h4>`
        }
        template += `
          <div style="padding-top: 5px" class="linkify-marker img-responsive-container">
            ${message}
          </div>
        `

        if ( image ) {
          //images.forEach((item, i, content) => {
          template += `<div style="padding-top: 5px" class="linkify-marker img-responsive-container">
            <p>
              <img src="${image.src}" style="width: 300px;" class="fr-fic fr-fil fr-dib" alt="image">
            </p>
          </div>`
          //})
        }

        template += `<div class="clearfix"></div>
          <div class="clearfix"> </div>
        </li>`

        return template
/*

      const ajax = {
        success: true,
        content: [
          {
            messageId: 13544995,
            profile: {
              id: 13544995,
              logo: "https://content.freelancehunt.com/profile/photo/50/forzz.png",
              link: "https://freelancehunt.com/freelancer/forzz.html",
              name: "Артём Литвинко"
            },
            isOwner: false,
            heading: "Верстка",
            message: "<p>Здравствуйте Дмитрий, вы уже нашли исполнителя на верстку?</p>",
            datetime: "2018-07-24T18:54:57Z",
            datetext: "24 июля в 21:54",
          },
          {
            messageId: 13545682,
            profile: {
              id: 331809,
              logo: "https://content.freelancehunt.com/profile/photo/50/andrush.png",
              link: "https://freelancehunt.com/employer/andrush.html",
              name: "Dmitry Andrushchenko"
            },
            isOwner: true,
            message: '<p>Нет, но завтра утром мне кого-то нужно будет выбрать:</p> <p><br></p> <p><br></p> <p>Сможете такое сделать?</p> <p><br></p> <p>Посмотрите внимательно картинку, она немного кривая, но думаю общий смысл я донес, нужно показать страницы конкретного сайта. Каждая страница должна состоять из нескольких блоков, возможно нужно добавить еще блока помимо "SEO ключи" - "фразы в топ" и "Конкуренты" , их я уже рисовать не стал. но если все сдвинуть немного вправо от картинки (скриншота), то думаю 2 блока еще можно аккуратно вместить.</p> <p>Думаю, что ьлок нужно свертсать с исполльзованием bootsrap, но это не является обязательным условием. Прошу лишь указать в заявке, что Вы собираетесь использовать. Для меня важен аккуратный код, который легко будет темизировать.</p> <p><br></p> <p>Я попробовал сделать, но получилось криво:&nbsp;<a href="http://46.4.130.245/test/test-bootstrap/111.html" rel="nofollow noopener" target="_blank">http://46.4.130.245/test/test-bootstrap/111.html</a></p>',
            datetime: "2018-07-24T19:41:01Z",
            datetext: "24 июля в 22:41",
            images: [
              {
                src: "https://content.freelancehunt.com/message/34082/a8fba/1034344/%D0%B8%D0%BA%D0%BE%D0%BD1.png"
              },
            ]
          },
          {
            messageId: 13545742,
            profile: {
              id: 13544995,
              logo: "https://content.freelancehunt.com/profile/photo/50/forzz.png",
              link: "https://freelancehunt.com/freelancer/forzz.html",
              name: "Артём Литвинко"
            },
            isOwner: false,
            message: "<p>Только вёрстка, я правильно понимаю?</p>",
            datetime: "2018-07-24T19:46:15Z",
            datetext: "24 июля в 22:46"
          },
          {
            messageId: 13545759,
            profile: {
              id: 13544995,
              logo: "https://content.freelancehunt.com/profile/photo/50/forzz.png",
              link: "https://freelancehunt.com/freelancer/forzz.html",
              name: "Артём Литвинко"
            },
            isOwner: false,
            message: "<p>Делать буду на bootstrap+ flex,</p>",
            datetime: "2018-07-24T19:47:53Z",
            datetext: "24 июля в 22:47"
          },
        ]
      }*/
    },

    galleryUploader() {
      const galleryUploader = new qq.FineUploader({
     
        element: document.getElementById("file-uploader"),

        autoUpload: !0,
        text: {
            defaultResponseError: "Системная ошибка при загрузке файла."
        },
        messages: {
            emptyError: "{file} имеет нулевой размер",
            sizeError: "{file} слишком большой, максимальный размер файла {sizeLimit}",
            tooManyItemsError: "Вы можете приложить к сообщению не более {itemLimit} файлов (приложено {netItems})",
            typeError: "Запрещенный тип файла {file}, разрешенные расширения: {extensions}"
        },
        validation: {
            itemLimit: 10,
            allowedExtensions: ["gif", "jpeg", "jpg", "png", "pdf", "psd", "gz", "7z", "docx", "doc", "zip", "rar", "rtf", "odt", "ott", "sxw", "ods", "ai", "gzip", "cdr", "mp3", "xlsx", "xls", "txt", "pptx", "ppt", "css", "c", "h", "js", "ico", "htm", "html", "csv", "yml", "json", "avi", "eps"],
            sizeLimit:  1e7
        },
        deleteFile: {
            enabled: !0,
            endpoint: "/upload/dodeleteattachment/for/message/attachment"
        },
        request: {
            endpoint: "/upload/domessageattach"
        },
        template: "file-uploader-template-bootstrap",
        classes: {
            success: "alert alert-success",
            fail: "alert alert-error"
        },
        showMessage: function(e) {
            Utils.warn(e)
        }
      })
    },
    dragndrop() {
      $('.note').each(function() {
        var element = this
        var lang = $(element).data('lang')
        
        if (typeof(lang) == 'undefined') {
          lang = 'en-US';
        }
        
        $(element).summernote({
          disableDragAndDrop: true,
          height: 300,
          lang: lang,
          emptyPara: '',
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'image', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
          ],
          buttons: {
          
            }
        })
      })
    },
  }


  // # Basic Elements
  // ============================================================================= //
  GRVE.basicElements = {
    init() {
    },
  }


  $(document).ready(() => { GRVE.documentReady.init() })
  $(window).smartresize(() => { GRVE.documentResize.init() })
  $(window).on('load', () => { GRVE.documentLoad.init() })
  $(window).on('scroll', () => { GRVE.documentScroll.init() })
}))(jQuery)
