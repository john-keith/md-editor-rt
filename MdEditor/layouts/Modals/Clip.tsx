import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { EditorContext } from '../../Editor';
import { prefix } from '../../config';
import { base642File } from '../../utils';
import bus from '../../utils/event-bus';

import './style.less';

interface ClipModalProp {
  visible: boolean;
  onCancel: () => void;
  onOk: (data?: any) => void;
}

let cropper: any = null;

const ClipModal = (props: ClipModalProp) => {
  const editorConext = useContext(EditorContext);
  const { editorId, usedLanguageText, Cropper } = editorConext;

  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadImgRef = useRef<HTMLImageElement>(null);

  // 预览框
  const previewTargetRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState({
    cropperInited: false,
    imgSelected: false,
    imgSrc: '',
    // 是否全屏
    isFullscreen: false
  });

  useEffect(() => {
    // 显示时构建实例及监听事件
    if (props.visible && !data.cropperInited) {
      window.Cropper = Cropper || window.Cropper;

      // 直接定义onchange，防止创建新的实例时遗留事件
      (uploadRef.current as HTMLInputElement).onchange = () => {
        const fileList = (uploadRef.current as HTMLInputElement).files || [];

        if (fileList?.length > 0) {
          const fileReader = new FileReader();

          fileReader.onload = (e: any) => {
            setData((_data) => ({
              ..._data,
              imgSelected: true,
              imgSrc: e.target.result
            }));
          };

          fileReader.readAsDataURL(fileList[0]);
        }
      };
    }
  }, [props.visible]);

  useEffect(() => {
    if (data.imgSrc) {
      cropper = new window.Cropper(uploadImgRef.current, {
        viewMode: 2,
        preview: `.${prefix}-clip-preview-target`
        // aspectRatio: 16 / 9,
      });
    }
  }, [data.imgSrc]);

  useEffect(() => {
    (previewTargetRef.current as HTMLImageElement)?.setAttribute('style', '');
  }, [data.imgSelected]);

  useEffect(() => {
    cropper?.destroy();
    (previewTargetRef.current as HTMLImageElement)?.setAttribute('style', '');

    if (uploadImgRef.current) {
      cropper = new window.Cropper(uploadImgRef.current, {
        viewMode: 2,
        preview: `.${prefix}-clip-preview-target`
        // aspectRatio: 16 / 9,
      });
    }
  }, [data.isFullscreen]);

  // 弹出层宽度
  const modalSize = useMemo(() => {
    return data.isFullscreen
      ? {
          width: '100%',
          height: '100%'
        }
      : {
          width: '668px',
          height: '392px'
        };
  }, [data.isFullscreen]);

  const reset = () => {
    cropper.destroy();
    (uploadRef.current as HTMLInputElement).value = '';
    setData((_data) => ({
      ..._data,
      imgSrc: '',
      imgSelected: false
    }));
  };

  return (
    <Modal
      title={usedLanguageText.clipModalTips?.title}
      visible={props.visible}
      onClosed={props.onCancel}
      showAdjust
      isFullscreen={data.isFullscreen}
      onAdjust={(val) => {
        setData({
          ...data,
          isFullscreen: val
        });
      }}
      {...modalSize}
    >
      <div className={`${prefix}-form-item ${prefix}-clip`}>
        <div className={`${prefix}-clip-main`}>
          {data.imgSelected ? (
            <div className={`${prefix}-clip-cropper`}>
              <img src={data.imgSrc} ref={uploadImgRef} style={{ display: 'none' }} />
              <div className={`${prefix}-clip-delete`} onClick={reset}>
                <svg className={`${prefix}-icon`} aria-hidden="true">
                  <use xlinkHref="#icon-delete" />
                </svg>
              </div>
            </div>
          ) : (
            <div
              className={`${prefix}-clip-upload`}
              onClick={() => {
                (uploadRef.current as HTMLInputElement).click();
              }}
            >
              <svg className={`${prefix}-icon`} aria-hidden="true">
                <use xlinkHref="#icon-upload" />
              </svg>
            </div>
          )}
        </div>
        <div className={`${prefix}-clip-preview`}>
          <div className={`${prefix}-clip-preview-target`} ref={previewTargetRef}></div>
        </div>
      </div>
      <div className={`${prefix}-form-item`}>
        <button
          className={`${prefix}-btn`}
          type="button"
          onClick={() => {
            const cvs = cropper.getCroppedCanvas();
            bus.emit(
              editorId,
              'uploadImage',
              [base642File(cvs.toDataURL('image/png'))],
              props.onOk
            );

            reset();
          }}
        >
          {usedLanguageText.linkModalTips?.buttonOK}
        </button>
      </div>
      <input
        ref={uploadRef}
        accept="image/*"
        type="file"
        multiple={false}
        style={{ display: 'none' }}
      />
    </Modal>
  );
};

export default ClipModal;
