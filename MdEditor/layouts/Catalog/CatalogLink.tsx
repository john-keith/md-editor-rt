import { prefix } from '../../config';
import React from 'react';
import { TocItem } from './index';
import { MarkedHeadingId } from '../../type';

export interface CatalogLinkProps {
  tocItem: TocItem;
  markedHeadingId: MarkedHeadingId;
  scrollElement: string | Element;
}

const CatalogLink = (props: CatalogLinkProps) => {
  return (
    <div
      className={`${prefix}-catalog-link`}
      onClick={(e) => {
        e.stopPropagation();
        const id = props.markedHeadingId(props.tocItem.text, props.tocItem.level);
        const targetHeadEle = document.getElementById(id);
        const scrollContainer =
          props.scrollElement instanceof Element
            ? props.scrollElement
            : document.querySelector(props.scrollElement);

        if (targetHeadEle && scrollContainer) {
          let par = targetHeadEle.offsetParent as HTMLElement;
          let offsetTop = targetHeadEle.offsetTop;

          // 滚动容器包含父级offser标准元素
          if (scrollContainer.contains(par)) {
            while (par && scrollContainer != par) {
              // 循环获取当前对象与相对的top高度
              offsetTop += par?.offsetTop;
              par = par?.offsetParent as HTMLElement;
            }
          }

          scrollContainer?.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }}
    >
      <span title={props.tocItem.text}>{props.tocItem.text}</span>
      <div className={`${prefix}-catalog-wrapper`}>
        {props.tocItem.children &&
          props.tocItem.children.map((item) => (
            <CatalogLink
              markedHeadingId={props.markedHeadingId}
              key={item.text}
              tocItem={item}
              scrollElement={props.scrollElement}
            />
          ))}
      </div>
    </div>
  );
};

export default CatalogLink;
