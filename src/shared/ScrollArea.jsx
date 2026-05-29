export default function ScrollArea({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`notification-scrollbar overflow-auto ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}
