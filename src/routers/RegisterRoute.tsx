export default function RegisterRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { data, isFetched } = useRootControllerGetMetadata();
  // const location = useLocation();
  // const currentPath = location.pathname;

  // if (!isFetched) return <></>;

  // if (data?.isInit) {
  //   return <Navigate to={currentPath} />;
  // }

  return <>{children}</>;
}
