import { footerLinks, socialLinks } from './content';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-6 bg-primary px-4 py-10 text-on-primary md:flex-row md:px-16">
      <div className="flex flex-col items-center gap-3 md:items-start">
        <img
          alt="NovaxClean Logo Footer"
          className="h-10 brightness-0 invert"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WX5RCerwHXn4XDK8ir8ZzsZ3G_dglhe8QEZ1mUyIN_taGiyoh2VuIrtvL3jr_S_aSRTWVtiSYQCK3zoV4Ddn1IM6ec8VJjisH0a49EViOKuZmfi8L9zRkxN-ygT1GFZSgbkW43fTYV8v0tpcdjYFJw3DXIqJkTw7QQcsfo0rMEDnFWnc_wJUiW4alccm8L9VG1I6MjLWa_HViB7_Q5X5FOQyoO9cXoAypb-GqgjPDwkYY738dxGmSV_bJqgV9bv9L_eee_KqWM"
        />
        <p className="max-w-xs text-center text-body-md text-surface-variant md:text-left">
          © 2024 NovaxClean. Limpieza que cuida, cuidado que se siente.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {footerLinks.map((link) => (
          <a key={link.label} className="text-label-md text-surface-variant transition-colors hover:text-white" href={link.href}>
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex gap-3">
        {socialLinks.map((social) => (
          <a
            key={social.icon}
            aria-label={social.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary"
            href={social.href}
          >
            <span className="material-symbols-outlined text-white">{social.icon}</span>
          </a>
        ))}
      </div>
    </footer>
  );
}