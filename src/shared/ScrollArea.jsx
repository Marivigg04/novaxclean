export default function ScrollArea({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={`notification-scrollbar overflow-auto overscroll-contain ${className}`}
      style={style}
      data-lenis-prevent
      {...props}
    >
      {children}
    </div>
  );
}
