// Global style module declarations so TypeScript accepts side-effect CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Allow importing plain global CSS (Next.js global styles) without module typing
declare module '*.css';