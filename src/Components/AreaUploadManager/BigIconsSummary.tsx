import React, {Fragment} from 'react';
import styled, {css} from 'styled-components';
import { Icon } from 'scorer-ui-kit';


interface ISvgIcons extends React.SVGProps<SVGSVGElement> {
    size: number
    color: string;
    weight: number
  }

const wrapperCss = css`
  
  line-height: 0;

  svg {
    overflow: visible;
    vector-effect: non-scaling-stroke;

    line, path, circle, ellipse, foreignObject, polygon, polyline, rect, text, textPath, tspan {
      vector-effect: non-scaling-stroke;
      transition: stroke var(--speed-normal) var(--easing-primary-out);
    }
  }
`;

const IconWrapper = styled.div`
  ${wrapperCss};
`;


const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 27px;
  ${IconWrapper} {
    display: flex;
    align-items: center;
  }
`;

const PlusIcon = styled(Icon)``;

const PlusIconWrapper = styled.div`
  margin: 0 30px;
  ${IconWrapper}{
    transform: rotate(45deg);
    [stroke]{
      stroke: var(--primary-7);
    }
  }
`;

interface IBigIconsSummary {
  icons: string[]
  color?: ISvgIcons['color']
  size?: number,
  weight?: 'light' | 'regular' | 'heavy' | 'strong'
}

const BigIconsSummary: React.FC<IBigIconsSummary> = ({
  icons,
  color = 'dimmed',
  size = 72,    
  weight='light',
  ...props
}) => {
  return (
    <Container {...props}>
      {icons.map((icon, index) => {
        return (
          <Fragment key={`type-upload-${icon}}`}>
            {(index !== 0) && <PlusIconWrapper><PlusIcon icon='CloseCompact' size={22} /></PlusIconWrapper>}
            <Icon icon={icon} {...{color, size, weight}} />
          </Fragment>
        );
      })}
    </Container>
  );
};

export default BigIconsSummary;